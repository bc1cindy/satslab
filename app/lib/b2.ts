// @ts-ignore - No types available for backblaze-b2
import B2 from 'backblaze-b2'
import { configManager } from './config'

class B2Service {
  private b2: B2 | null = null
  private storageConfig: ReturnType<typeof configManager.getStorageProvider> | null = null

  constructor() {
    // Get storage configuration through secure config manager
    const provider = configManager.getStorageProvider()
    if (!provider) {
      throw new Error('B2 storage not configured - Pro video features disabled')
    }
    this.storageConfig = provider
  }

  private async initializeB2() {
    if (!this.b2 && this.storageConfig) {
      // Use abstracted storage configuration
      const storageConfig = configManager.getStorageConfig()
      if (!storageConfig) {
        throw new Error('Storage configuration not available')
      }

      this.b2 = new B2({
        applicationKeyId: storageConfig.credentials.keyId,
        applicationKey: storageConfig.credentials.key,
      })

      try {
        await this.b2.authorize()
        console.log('✅ B2 authorized successfully')
      } catch (error) {
        console.error('❌ B2 authorization failed:', error)
        throw error
      }
    }
    return this.b2
  }

  async generateSecureVideoUrl(filename: string, expirationHours: number = 24): Promise<string> {
    try {
      const b2 = await this.initializeB2()
      const storageConfig = configManager.getStorageConfig()
      
      if (!storageConfig) {
        throw new Error('Storage configuration not available')
      }
      
      const response = await b2.getDownloadAuthorization({
        bucketId: storageConfig.bucket.id,
        fileNamePrefix: filename,
        validDurationInSeconds: expirationHours * 3600,
      })

      const authToken = response.data.authorizationToken
      const encodedFilename = encodeURIComponent(filename).replace(/%2F/g, '/')
      const secureUrl = `${storageConfig.baseUrl}/${encodedFilename}?Authorization=${authToken}`
      
      console.log(`🔗 Generated secure URL for ${filename} (expires in ${expirationHours}h)`)
      return secureUrl

    } catch (error) {
      console.error(`❌ Error generating secure URL for ${filename}:`, error)
      throw error
    }
  }

  async listVideoFiles(): Promise<Array<{ fileName: string, fileSize: number, uploadTimestamp: number }>> {
    try {
      const b2 = await this.initializeB2()
      const storageConfig = configManager.getStorageConfig()
      
      if (!storageConfig) {
        throw new Error('Storage configuration not available')
      }
      
      const response = await b2.listFileNames({
        bucketId: storageConfig.bucket.id,
        maxFileCount: 100,
      })

      const videos = response.data.files
        .filter((file: any) => file.fileName.endsWith('.mp4'))
        .map((file: any) => ({
          fileName: file.fileName,
          fileSize: file.size,
          uploadTimestamp: file.uploadTimestamp,
        }))

      console.log(`📁 Found ${videos.length} video files in B2`)
      return videos

    } catch (error) {
      console.error('❌ Error listing video files:', error)
      throw error
    }
  }

  async getVideoMetadata(filename: string): Promise<any> {
    try {
      const b2 = await this.initializeB2()
      const storageConfig = configManager.getStorageConfig()
      
      if (!storageConfig) {
        throw new Error('Storage configuration not available')
      }
      
      const response = await b2.listFileNames({
        bucketId: storageConfig.bucket.id,
        startFileName: filename,
        maxFileCount: 1,
      })

      const file = response.data.files.find((f: any) => f.fileName === filename)
      
      if (!file) {
        throw new Error(`Video file ${filename} not found`)
      }

      return {
        fileName: file.fileName,
        fileSize: file.size,
        uploadTimestamp: file.uploadTimestamp,
        contentType: file.contentType,
      }

    } catch (error) {
      console.error(`❌ Error getting metadata for ${filename}:`, error)
      throw error
    }
  }

  // 🔒 MÉTODO REMOVIDO POR SEGURANÇA
  // getPublicVideoUrl foi removido para prevenir bypass de proteção Pro
  // Todos os vídeos Pro devem usar apenas URLs temporárias assinadas
}

// Export singleton instance
export const b2Service = new B2Service()
export default b2Service