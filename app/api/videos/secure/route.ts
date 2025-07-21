import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { createClient } from '@supabase/supabase-js'
// @ts-ignore - No types available for backblaze-b2
import B2 from 'backblaze-b2'

export const dynamic = 'force-dynamic'

// Simplified B2 client without dependencies
async function listB2Files(): Promise<string[]> {
  const b2 = new B2({
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
    applicationKey: process.env.B2_APPLICATION_KEY!,
  })

  await b2.authorize()
  
  const response = await b2.listFileNames({
    bucketId: process.env.B2_BUCKET_ID!,
    maxFileCount: 100,
  })

  return response.data.files
    .filter((file: any) => file.fileName.endsWith('.mp4'))
    .map((file: any) => file.fileName)
}

async function generateSecureB2Url(filename: string): Promise<string> {
  const b2 = new B2({
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
    applicationKey: process.env.B2_APPLICATION_KEY!,
  })

  await b2.authorize()
  
  const response = await b2.getDownloadAuthorization({
    bucketId: process.env.B2_BUCKET_ID!,
    fileNamePrefix: filename,
    validDurationInSeconds: 24 * 3600, // 24 hours
  })

  const authToken = response.data.authorizationToken
  const encodedFilename = encodeURIComponent(filename).replace(/%2F/g, '/')
  const baseUrl = process.env.SATSLAB_PRO_VIDEOS_BASE_URL!
  
  return `${baseUrl}/${encodedFilename}?Authorization=${authToken}`
}

export async function GET(request: NextRequest) {
  try {
    // 🔒 VERIFICAR AUTENTICAÇÃO
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Não autorizado - Login necessário' 
      }, { status: 401 })
    }

    console.log('Generating secure video URL for:', session.user.email)

    // 🔒 VERIFICAR ACESSO PRO
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: user, error } = await supabase
      .from('users')
      .select('has_pro_access, pro_expires_at')
      .eq('email', session.user.email)
      .single()

    if (error || !user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 403 })
    }

    const now = new Date()
    const expiresAt = user.pro_expires_at ? new Date(user.pro_expires_at) : null
    const hasValidProAccess = user.has_pro_access && (!expiresAt || expiresAt > now)

    if (!hasValidProAccess) {
      return NextResponse.json({ 
        error: 'Acesso Pro necessário ou expirado' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('file')
    
    if (!filename) {
      return NextResponse.json({ 
        error: 'Filename é obrigatório' 
      }, { status: 400 })
    }

    console.log('Generating URL for video:', filename)

    // Basic security check against path traversal
    if (filename.includes('..') || filename.includes('\\') || !filename.includes('SatsLabPro/')) {
      return NextResponse.json(
        { error: 'Acesso negado: filename inválido' },
        { status: 400 }
      )
    }
    
    try {
      // First, list all files to see exact filenames in B2
      console.log('📁 Listing B2 files to find exact match...')
      const b2Files = await listB2Files()
      console.log('📁 B2 files found:', b2Files)
      
      // Find exact match
      const exactMatch = b2Files.find(file => 
        file === filename || 
        file.normalize('NFC') === filename.normalize('NFC') ||
        file.normalize('NFD') === filename.normalize('NFD')
      )
      
      if (exactMatch) {
        console.log('✅ Found exact match:', exactMatch)
        const secureUrl = await generateSecureB2Url(exactMatch)
        console.log('✅ Generated secure URL successfully')
        
        return NextResponse.json({
          url: secureUrl,
          filename: exactMatch,
          originalFilename: filename,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          source: 'backblaze_b2'
        })
      }
      
      // If no exact match, find partial matches for debugging
      const partialMatches = b2Files.filter(file => 
        file.toLowerCase().includes(filename.split('/')[1]?.toLowerCase().substring(0, 10) || '')
      )
      
      console.log('❌ No exact match found. Partial matches:', partialMatches)
      
      // Try original approach with normalizations as fallback
      let secureUrl
      let lastError
      
      const normalizations = [
        filename, // Original
        filename.normalize('NFC'), // Canonical composition
        filename.normalize('NFD'), // Canonical decomposition
        filename.normalize('NFKC'), // Compatibility composition
        filename.normalize('NFKD'), // Compatibility decomposition
      ]
      
      console.log('Trying normalizations for:', filename)
      
      for (const normalizedFilename of normalizations) {
        try {
          console.log('Attempting with normalization:', normalizedFilename === filename ? 'original' : 'normalized')
          secureUrl = await generateSecureB2Url(normalizedFilename)
          console.log('✅ Success with normalization!')
          break
        } catch (error) {
          console.log('❌ Failed with this normalization:', error instanceof Error ? error.message : 'Unknown error')
          lastError = error
          continue
        }
      }
      
      if (!secureUrl) {
        throw lastError || new Error('All normalization attempts failed')
      }
      
      console.log('Generated secure URL successfully')
      
      return NextResponse.json({
        url: secureUrl,
        filename,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        source: 'backblaze_b2'
      })

    } catch (error) {
      console.error('Error generating B2 URL:', error)
      
      return NextResponse.json({ 
        error: 'Serviço temporariamente indisponível',
        message: 'Não foi possível gerar acesso seguro ao vídeo. Tente novamente em alguns minutos.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      }, { status: 503 })
    }
  } catch (authError) {
    console.error('Authentication error in video access:', authError)
    return NextResponse.json({ 
      error: 'Erro de autenticação' 
    }, { status: 500 })
  }
}