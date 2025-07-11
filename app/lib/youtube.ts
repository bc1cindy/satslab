import { cache } from 'react'

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  isLive?: boolean
}

// Cache the function to avoid multiple API calls
export const getLatestVideos = cache(async (): Promise<YouTubeVideo[]> => {
  const CHANNEL_ID = 'UC_YOUR_CHANNEL_ID' // Replace with @CindyBTC channel ID
  const API_KEY = process.env.YOUTUBE_API_KEY
  
  // If no API key, return mock data
  if (!API_KEY) {
    console.warn('YouTube API key not found. Using mock data.')
    return getMockVideos()
  }

  try {
    // First, get the channel's uploads playlist ID
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    )
    
    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel data')
    }
    
    const channelData = await channelResponse.json()
    const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads
    
    if (!uploadsPlaylistId) {
      throw new Error('Uploads playlist not found')
    }
    
    // Get the latest videos from the uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=8&key=${API_KEY}`
    )
    
    if (!videosResponse.ok) {
      throw new Error('Failed to fetch videos')
    }
    
    const videosData = await videosResponse.json()
    
    return videosData.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.maxres?.url || 
                 item.snippet.thumbnails.high?.url || 
                 item.snippet.thumbnails.default.url,
      publishedAt: item.snippet.publishedAt,
      isLive: item.snippet.liveBroadcastContent === 'live'
    }))
    
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return getMockVideos()
  }
})

// Alternative: Fetch directly from our API route
export async function getVideosWithoutAPI(): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch('/api/youtube', {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos')
    }
    
    const data = await response.json()
    return data.videos
  } catch (error) {
    console.error('Error fetching videos:', error)
    return getMockVideos()
  }
}

function getMockVideos(): YouTubeVideo[] {
  return [
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
}