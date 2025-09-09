import axios from 'axios'

interface WorkingUrlResponse {
  success: boolean
  code: number
  url: string
  format?: string
  error?: string
}

const abortTimeout = 5000

/**
 * Fetches the head of a URL
 * @param url - The URL to fetch
 * @returns Promise<WorkingUrlResponse> - Object containing success status and details
 */
async function fetchUrlHead(url: string): Promise<WorkingUrlResponse> {
  try {
    const response = await axios.head(url, { 
      signal: AbortSignal.timeout(abortTimeout) 
    })
    
    // Consider 2xx and 3xx status codes as valid responses
    const isValidResponse = response.status >= 200 && response.status < 400
    
    if (isValidResponse) {
      return {
        success: true,
        code: response.status,
        url: url,
        format: response.headers['content-type']
      }
    } else {
      return {
        success: false,
        code: response.status,
        url: url,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error: any) {
    let errorCode = 0
    let errorMsg = 'Unknown error'
    
    if (error.code === 'ECONNABORTED') {
      errorMsg = 'Request timeout'
    } else if (error.response) {
      // Server responded with error status
      errorCode = error.response.status
      errorMsg = `HTTP ${error.response.status}: ${error.response.statusText}`
    } else if (error.request) {
      // Request was made but no response received
      errorMsg = 'No response received'
    } else {
      // Something else happened
      errorMsg = error.message || 'Request failed'
    }
    
    return {
      success: false,
      code: errorCode,
      url: url,
      error: errorMsg
    }
  }
}

/**
 * Converts an Arweave URL to an HTTP URL
 * @param url - The Arweave URL to convert
 * @returns The HTTP URL
 */
export function getArweaveUrlAsHttp(url: string): string {
  const arweaveGateway = 'https://arweave.net/'
  return url.replace('ar://', arweaveGateway)
}

/**
 * Converts HTTP URLs from various IPFS gateways to ipfs:// URLs
 * @param url - The HTTP URL to convert
 * @returns The ipfs:// URL or null if not an IPFS gateway URL
 */
export function getIpfsUrl(url: string): string | null {
  let cid: string | undefined;

  if (url.startsWith("https://ipfs.io/ipfs/")) {
    cid = url.replace("https://ipfs.io/ipfs/", "");
  } else if (url.startsWith("https://cloudflare-ipfs.com/ipfs/")) {
    cid = url.replace("https://cloudflare-ipfs.com/ipfs/", "");
  } else if (url.startsWith("https://gateway.pinata.cloud/ipfs/")) {
    cid = url.replace("https://gateway.pinata.cloud/ipfs/", "");
  } else if (url.startsWith("https://ipfs.infura.io/ipfs/")) {
    cid = url.replace("https://ipfs.infura.io/ipfs/", "");
  } else if (url.startsWith("https://ipfs.fleek.co/ipfs/")) {
    cid = url.replace("https://ipfs.fleek.co/ipfs/", "");
  } else if (url.startsWith("https://dweb.link/ipfs/")) {
    cid = url.replace("https://dweb.link/ipfs/", "");
  } else if (url.startsWith("https://ipfs.itslit.org/ipfs/")) { 
    cid = url.replace("https://ipfs.itslit.org/ipfs/", "");
  } else if (url.startsWith("https://ipfs.dylmusic.com/ipfs/")) {
    cid = url.replace("https://ipfs.dylmusic.com/ipfs/", "");
  } else if (url.startsWith("https://ipfs.filebase.io/ipfs/")) {
    cid = url.replace("https://ipfs.filebase.io/ipfs/", "");
  } else if (url.includes("pinata.cloud/ipfs/")) {
    cid = url.split("pinata.cloud/ipfs/")[1];
    cid = cid.replace("http://", "");
    cid = cid.replace("https://", "");
  } else if (url.includes(".ipfs.sphn.link/")) {
    cid = url.split(".ipfs.sphn.link/")[1];
    cid = cid.replace("http://", "");
    cid = cid.replace("https://", "");
  }

  if (cid) {
    return String("ipfs://" + cid);
  }
  
  return null;
}

/**
 * Checks if a URL is working by performing a HEAD request
 * @param url - The URL to check
 * @returns Promise<WorkingUrlResponse> - Object containing success status and details
 */
export async function getWorkingUrl(
  url: string
): Promise<WorkingUrlResponse> {
  if (url.startsWith('ipfs://')) {
    const ipfsGateways = [
      'https://ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://ipfs.filebase.io/ipfs/'
    ]
    
    for (const gateway of ipfsGateways) {
      const ipfsUrl = url.replace('ipfs://', gateway)
      const result = await fetchUrlHead(ipfsUrl)
      if (result.success) {
        return result
      }
    }
  }

  if (url.startsWith('ar://')) {
    url = getArweaveUrlAsHttp(url)
  }

  return await fetchUrlHead(url)
}

/**
 * Checks if a URL is working and returns an image
 * @param url - The URL to check
 * @returns Promise<WorkingUrlResponse> - Object containing success status and details
 */
export async function getWorkingImageUrl(url: string): Promise<WorkingUrlResponse> {
  const result = await getWorkingUrl(url)
  
  // If the URL check failed, return the error
  if (!result.success) {
    return result
  }
  
  // Check if the content-type indicates an image
  const contentType = result.format?.toLowerCase() || ''
  const isImage = contentType.startsWith('image/')
  
  if (isImage) {
    return result
  } else {
    return {
      success: false,
      code: result.code,
      url: url,
      error: `URL is accessible but not an image. Content-Type: ${contentType}`
    }
  }
}
