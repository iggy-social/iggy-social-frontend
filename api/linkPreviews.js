const axios = require('axios')

export default async function handler(request, response) {
  try {
    // Check if URL parameter is provided
    if (!request.query || !request.query.url) {
      return response.status(400).json({ 
        error: 'URL parameter is required',
        data: null 
      })
    }

    const url = request.query.url

    // Validate URL format
    try {
      new URL(url)
    } catch (urlError) {
      return response.status(400).json({ 
        error: 'Invalid URL format',
        data: null 
      })
    }

    // Simple fallback metadata for now
    let metadata = {
      url: url,
      title: null,
      description: 'Link preview service is temporarily unavailable',
      image: { url: null }
    }

    // Try to fetch basic metadata if it's a simple URL
    try {
      const axiosResponse = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)'
        }
      })
      
      const html = axiosResponse.data
      
      // Extract title from HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) {
        metadata.title = titleMatch[1].trim()
      } else {
        const ogTitleMatch = html.match(
          /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
        )
        if (ogTitleMatch) {
          metadata.title = ogTitleMatch[1].trim()
        } else {
          // find the first h1 in the HTML
          const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
          if (h1Match) {
            metadata.title = h1Match[1].trim()
          }
        }
      }
      
      // Extract description from meta tags
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      if (descMatch) {
        metadata.description = descMatch[1].trim()
      } else {
        const ogDescMatch = html.match(
          /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
        )
        if (ogDescMatch) {
          metadata.description = ogDescMatch[1].trim()
        } else {
          metadata.description = null
        }
      }
      
      // Extract image from meta tags
      const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      if (imageMatch) {
        metadata.image.url = imageMatch[1].trim()
      } else {
        // find the first image in the HTML
        const imageRegex = /<img[^>]*src=["']([^"']+)["']/gi
        const imageMatches = html.match(imageRegex)
        if (imageMatches) {
          metadata.image.url = imageMatches[0].trim()
        } else {
          const titleWithoutSpaces = metadata.title?.replace(/\s+/g, '+')
          metadata.image.url = "https://placehold.co/600x400/8e85e6/FFF?text=" + titleWithoutSpaces
        }
      }
      
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError.message)
      // Keep the fallback metadata
    }

    return response.status(200).json({ data: metadata })
    
  } catch (error) {
    console.error('Link preview function error:', error)
    
    return response.status(500).json({ 
      error: 'Internal server error',
      data: null 
    })
  }
}
