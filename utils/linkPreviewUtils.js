const axios = require('axios');
const ethers = require('ethers');
const metascraper = require('metascraper')([
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-title')()
]);

async function fetchMetadata(url) {
  let metadata;
  let status;

  try {
    if (url.startsWith("https://opensea.io")) {
      metadata = await getOpenSeaPreview(url);
    } else if (url.startsWith("https://sparklesnft.com/item/")) {
      metadata = await getSparklesPreview(url);
    } else if (url.startsWith("https://twitter.com") || url.startsWith("https://x.com")) {
      metadata = getTwitterPreview(url);
    } else if (url.startsWith("https://dune.com")) {
      metadata = getDunePreview(url);
    } else {
      metadata = await getMetascraperPreview(url);
    }

    status = 200;
  } catch (error) {
    console.log(error);
    metadata = { error: "Error fetching URL preview data." };
    status = 500;
  }

  return { metadata, status };
}

async function fetchNftMetadata(url, addr, tokenId, rpcUrl, marketplace) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const nftInterface = new ethers.utils.Interface([
    "function uri(uint256 _tokenId) external view returns (string memory)",
    "function tokenURI(uint256 _tokenId) external view returns (string memory)"
  ]);

  const nftContract = new ethers.Contract(addr, nftInterface, provider);

  let nftMetadataUri;

  try {
    // erc-1155
    nftMetadataUri = await nftContract.uri(tokenId);
  } catch (error) {
    // erc-721
    nftMetadataUri = await nftContract.tokenURI(tokenId);
  }

  let json;

  if (
    !nftMetadataUri.startsWith("https://") && 
    !nftMetadataUri.startsWith("http://") &&
    !nftMetadataUri.startsWith("ipfs://")
  ) {
    const result = atob(nftMetadataUri.substring(29));
    json = JSON.parse(result);
  } else {
    if (nftMetadataUri.startsWith("ipfs://")) {
      // ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2614
      // https://dweb.link/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2614
      // https://cloudflare-ipfs.com/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2614

      nftMetadataUri = nftMetadataUri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
    } 

    try {
      const res = await axios.get(nftMetadataUri);
      json = await res.data;
    } catch (error) {
      console.log("error fetching metadata from ipfs for " + url);
    }
    
  }

  if (!json) {
    return null;
  }

  if (json["image"].startsWith("ipfs://")) {
    json["image"] = json["image"].replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
  } 

  if (!json["description"]) {
    json["description"] = url;
  }

  if (!json["name"]) {
    json["name"] = tokenId;
  }

  return {
    "url": url,
    "title": json?.name,
    "description": json?.description, 
    "image": { 
      url: json["image"]
    }
  };
}

function getDunePreview(url) {
  return {
    "url": url,
    "title": "Dune",
    "description": "Blockchain ecosystem analytics by and for the community. Explore and share data from Ethereum, Polygon, Arbitrum, Optimism, and others for free.", 
    "image": { 
      url: "https://dune.com/assets/poster-1440w.png"
    }
  }
}

async function getMetascraperPreview(url) {
  let metadata;

  try {
    const res = await axios.get(url); 
    const html = await res.data;
    const mdRes = await metascraper({ html, url });

    metadata = {
      "url": url,
      "title": mdRes.title,
      "description": mdRes.description,
      "image": { 
        url: mdRes.image
      }
    };
  } catch (error) {
    //console.log(error);
  }

  return metadata;
}

async function getOpenSeaPreview(url) {
  let finalMetadata = {
    title: "OpenSea",
    description: "OpenSea is the first web3 marketplace for NFTs and crypto collectibles. Browse, create, buy, sell, and auction NFTs using OpenSea today.",
    image: {
      url: "https://i.postimg.cc/Gm6KcZXB/opensea.jpg"
    }
  };

  if (url.startsWith("https://opensea.io/assets/arbitrum/")) {
    const cleanUrl = url.split("?")[0];
    const addrTokenId = cleanUrl.split("opensea.io/assets/arbitrum/")[1];
    const addr = addrTokenId.split("/")[0];
    const tokenId = addrTokenId.split("/")[1].replace("/", "");
    finalMetadata = await fetchNftMetadata(url, addr, tokenId, "https://rpc.ankr.com/arbitrum", "opensea"); 
  } else if (url.startsWith("https://opensea.io/assets/avalanche/")) {
    const cleanUrl = url.split("?")[0];
    const addrTokenId = cleanUrl.split("opensea.io/assets/avalanche/")[1];
    const addr = addrTokenId.split("/")[0];
    const tokenId = addrTokenId.split("/")[1].replace("/", "");
    finalMetadata = await fetchNftMetadata(url, addr, tokenId, "https://rpc.ankr.com/avalanche", "opensea"); 
  } else if (url.startsWith("https://opensea.io/assets/base/")) {
    const cleanUrl = url.split("?")[0];
    const addrTokenId = cleanUrl.split("opensea.io/assets/base/")[1];
    const addr = addrTokenId.split("/")[0];
    const tokenId = addrTokenId.split("/")[1].replace("/", "");
    finalMetadata = await fetchNftMetadata(url, addr, tokenId, "https://mainnet.base.org", "opensea"); 
  } else if (url.startsWith("https://opensea.io/assets/bsc/")) {
    const cleanUrl = url.split("?")[0];
    const addrTokenId = cleanUrl.split("opensea.io/assets/bsc/")[1];
    const addr = addrTokenId.split("/")[0];
    const tokenId = addrTokenId.split("/")[1].replace("/", "");
    finalMetadata = await fetchNftMetadata(url, addr, tokenId, "https://rpc.ankr.com/bsc", "opensea"); 
  } else if (url.startsWith("https://opensea.io/assets/ethereum/")) {
    const cleanUrl = url.split("?")[0];
    const addrTokenId = cleanUrl.split("opensea.io/assets/ethereum/")[1];
    const addr = addrTokenId.split("/")[0];
    const tokenId = addrTokenId.split("/")[1].replace("/", "");
    finalMetadata = await fetchNftMetadata(url, addr, tokenId, "https://rpc.ankr.com/eth", "opensea"); 
  } else if (url.startsWith("https://opensea.io/assets/optimism/")) {
    const cleanUrl = url.split("?")[0];
    const addrTokenId = cleanUrl.split("opensea.io/assets/optimism/")[1];
    const addr = addrTokenId.split("/")[0];
    const tokenId = addrTokenId.split("/")[1].replace("/", "");
    finalMetadata = await fetchNftMetadata(url, addr, tokenId, "https://rpc.ankr.com/optimism", "opensea"); 
  } else if (url.startsWith("https://opensea.io/assets/matic/")) {
    const cleanUrl = url.split("?")[0];
    const addrTokenId = cleanUrl.split("opensea.io/assets/matic/")[1];
    const addr = addrTokenId.split("/")[0];
    const tokenId = addrTokenId.split("/")[1].replace("/", "");
    finalMetadata = await fetchNftMetadata(url, addr, tokenId, "https://rpc.ankr.com/polygon", "opensea"); 
  } else if (url.startsWith("https://opensea.io/assets/zora/")) {
    const cleanUrl = url.split("?")[0];
    const addrTokenId = cleanUrl.split("opensea.io/assets/zora/")[1];
    const addr = addrTokenId.split("/")[0];
    const tokenId = addrTokenId.split("/")[1].replace("/", "");
    finalMetadata = await fetchNftMetadata(url, addr, tokenId, "https://rpc.zora.energy", "opensea"); 
  }

  return finalMetadata;
}

// https://bafybeihpjhkeuiq3k6nqa3fkgeigeri7iebtrsuyuey5y6vy36n345xmbi.ipfs.dweb.link/2614
// ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2614
//  https://dweb.link/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2614

async function getSparklesPreview(url) {
  let rpcUrl = "https://flare-api.flare.network/ext/C/rpc";
  let urlStart = "https://sparklesnft.com/item/flare/";

  if (url.startsWith("https://sparklesnft.com/item/songbird/")) {
    rpcUrl = "https://songbird-api.flare.network/ext/C/rpc";
    urlStart = "https://sparklesnft.com/item/songbird/";
  }

  const cleanUrl = url.split("?")[0];
  const addrTokenId = cleanUrl.split(urlStart)[1].replace("/", "");
  const addr = addrTokenId.split("_")[0];
  const tokenId = addrTokenId.split("_")[1];

  finalMetadata = await fetchNftMetadata(url, addr, tokenId, rpcUrl, "sparkles"); // TODO

  return finalMetadata;
}

function getTwitterPreview(url) {
  return {
    "url": url,
    "title": "Twitter / X.com",
    "description": "Elon's land, Elon's rules. Enter at your own risk.", 
    "image": { 
      url: "https://www.newswire.lk/wp-content/uploads/2022/12/elon-musk-twitter.jpg"
    }
  };
}

function marketplaceFallback(marketplace) {
  if (marketplace === "opensea") {
    return {
      "name": "Check this NFT on OpenSea",
      "description": "OpenSea is the world's first and largest web3 marketplace for NFTs and crypto collectibles. Browse, create, buy, sell, and auction NFTs using OpenSea today.",
      "image": "https://static.opensea.io/og-images/Metadata-Image.png"
    }
  } else if (marketplace === "sparkles") {
    return {
      "name": "Check this NFT on Sparkles",
      "description": "Sparkles NFT Marketplace",
      "image": "https://i.postimg.cc/QMCd8ynT/sparkles.png"
    }
  }
}

module.exports = {
  fetchMetadata
};
