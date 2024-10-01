import axios from "axios";

const abortTimeout = 5000

export function getIpfsUrl(url) {
  let cid;

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

export async function getWorkingUrl(url) {
  const config = useRuntimeConfig();
  let ipfsUrl = url

  if (url.startsWith("http")) {
    // fetch head() with axios to check if the url is working
    try {
      const response = await axios.head(url, { signal: AbortSignal.timeout(abortTimeout) })
      if (response.status === 200) {
        return { success: true, url: url, format: response.headers['content-type'] }
      } else {
        ipfsUrl = getIpfsUrl(url)
      }
    } catch (error) {
      ipfsUrl = getIpfsUrl(url)
    }
  }

  if (!ipfsUrl) {
    return url
  }

  const ipfsGateways = [
    'https://ipfs.io/ipfs/',
    'https://ipfs.filebase.io/ipfs/',
    //'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
  ]

  if (ipfsUrl.startsWith("ipfs://")) {
    const cid = ipfsUrl.replace("ipfs://", "")

    for (let i = 0; i < ipfsGateways.length; i++) {
      const gatewayUrl = ipfsGateways[i] + cid

      // fetch head() with axios to check if the url is working
      try {
        const response = await axios.head(gatewayUrl, { signal: AbortSignal.timeout(abortTimeout) })
        if (response.status === 200) {
          return { success: true, url: gatewayUrl, format: response.headers['content-type'] }
        }
      } catch (error) {
        continue
      }
    }
  } else if (url.startsWith("ar://")) {
    const arweaveUrl = url.replace("ar://", config.arweaveGateway)
    
    try {
      const response = await axios.head(arweaveUrl, { signal: AbortSignal.timeout(abortTimeout) })
      if (response.status === 200) {
        return { success: true, url: arweaveUrl, format: response.headers['content-type'] }
      }
    } catch (error) {
      return url
    }
  }

  return url

}