import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Using YouTube channel handle to get channel ID
    const channelHandle = '@CindyBTC'
    
    // First, try to get channel info from the handle
    const channelUrl = `https://www.youtube.com/${channelHandle}`
    
    // Channel ID for @CindyBTC
    const CHANNEL_ID = 'UCvr9Bb_1nM6exxRm8Te7pcA'
    
    // Use YouTube RSS feed (doesn't require API key)
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
    
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed')
    }
    
    const text = await response.text()
    
    // Parse XML to extract video data
    const videos = []
    const entries = text.match(/<entry>[\s\S]*?<\/entry>/g) || []
    
    for (const entry of entries.slice(0, 8)) { // Get latest 8 videos
      const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)
      const titleMatch = entry.match(/<title>(.*?)<\/title>/)
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/)
      
      if (idMatch && titleMatch) {
        // Decode HTML entities in title
        const title = titleMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
        
        videos.push({
          id: idMatch[1],
          title: title,
          thumbnail: `https://i.ytimg.com/vi/${idMatch[1]}/maxresdefault.jpg`,
          publishedAt: publishedMatch?.[1] || new Date().toISOString(),
          isLive: false
        })
      }
    }
    
    return NextResponse.json({ videos })
    
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    
    // Return mock data as fallback
    const mockVideos = [
      {
        id: 'dQw4w9WgXcQ',
        title: 'Bitcoin para Iniciantes - Live',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        publishedAt: new Date().toISOString(),
        isLive: false
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'Como Usar Lightning Network',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'Segurança em Bitcoin',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'Carteiras Bitcoin Explicadas',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        publishedAt: new Date().toISOString(),
      }
    ]
    
    return NextResponse.json({ videos: mockVideos })
  }
}