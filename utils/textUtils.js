export function findFirstCollectionUrl(text) {
  // if there is an NFT collection url (from our website) in the text, return it as address string
  // example:
  //   - input: https://sgb.chat/nft/collection?id=0x5923c15079AF3E14FBF96bd2fC1127633d42Ff28
  //   - output: 0x5923c15079AF3E14FBF96bd2fC1127633d42Ff28

  const config = useRuntimeConfig()

  let urlRegex

  try {
    urlRegex = new RegExp(
      '(https?:\\/\\/|ipfs:\\/\\/|ar:\\/\\/)(?!.*\\.(jpg|png|jpeg|img|gif|webp|pdf|docx))[^\\s]+',
      'g',
    )
  } catch (error) {
    // fallback to simplified regex (without lookbehinds) in case of an old browser or Safari
    urlRegex = /(https?:\/\/|ipfs:\/\/|ar:\/\/)(?!.*\.(jpg|png|jpeg|img|gif|webp|pdf|docx))[^\s]+/g
  }

  const match = text.match(urlRegex)

  if (match) {
    const url = match[0]

    if (url.startsWith(config.projectUrl + '/nft/collection')) {
      return url.split('?id=')[1] // return address string
    }

    return null
  }

  return null
}

export function findFirstUrl(text) {
  const config = useRuntimeConfig()

  let urlRegex

  try {
    urlRegex = new RegExp(
      '(https?:\\/\\/|ipfs:\\/\\/|ar:\\/\\/)(?!.*\\.(jpg|png|jpeg|img|gif|webp|pdf|docx))[^\\s]+',
      'g',
    )
  } catch (error) {
    // fallback to simplified regex (without lookbehinds) in case of an old browser or Safari
    urlRegex = /(https?:\/\/|ipfs:\/\/|ar:\/\/)(?!.*\.(jpg|png|jpeg|img|gif|webp|pdf|docx))[^\s]+/g
  }

  const match = text.match(urlRegex)

  if (match) {
    const url = match[0]

    if (
      url.startsWith('https://www.youtube.com') ||
      url.startsWith('http://www.youtube.com') ||
      url.startsWith('https://youtu.be') ||
      url.startsWith('http://youtu.be')
    ) {
      // ignore youtube embeds
      return null
    } else if (url.startsWith(config.projectUrl + '/nft/collection')) {
      // ignore collection links from our website
      return null
    }

    return url
  }

  return null
}

export function getAllImagesFromText(text) {
  const config = useRuntimeConfig()

  if (!text) {
    return []
  }

  // find multiple image links in the text and return them as an array
  let imageRegex = /(?:http|https|ipfs|ar):\/\/.*\.(?:png|jpg|jpeg|gif|webp)/i;
  let imageLinks = text.match(imageRegex) || []

  const imageRegex2 = /(http|https|ipfs|ar):\/\/\S+\?.img/g
  const imageLinks2 = text.match(imageRegex2)

  if (imageLinks2) {
    imageLinks = imageLinks.concat(imageLinks2)
  }

  const imageRegex3 = /(http|https|ipfs|ar):\/\/\S+\?img/g
  const imageLinks3 = text.match(imageRegex3)

  if (imageLinks3) {
    imageLinks = imageLinks.concat(imageLinks3)
  }

  if (!imageLinks) {
    return []
  } else {
    for (let i = 0; i < imageLinks.length; i++) {
      if (imageLinks[i].startsWith('ar://')) {
        imageLinks[i] = imageLinks[i].replace('ar://', config.arweaveGateway)
      } else if (imageLinks[i].startsWith('ipfs://')) {
        imageLinks[i] = imageLinks[i].replace('ipfs://', 'https://ipfs.io/ipfs/')
      }
    }
  }

  return imageLinks
}

export function getImageFromText(text) {
  const config = useRuntimeConfig()

  if (!text) {
    return null
  }

  let imageRegex = /(http|https|ipfs|ar):\/\/.*\.(?:png|jpg|jpeg|gif|webp)/i
  let imageLinks = text.match(imageRegex) || []

  const imageRegex2 = /(http|https|ipfs|ar):\/\/\S+\?.img/g
  const imageLinks2 = text.match(imageRegex2)

  if (imageLinks2) {
    imageLinks = imageLinks.concat(imageLinks2)
  }

  const imageRegex3 = /(http|https|ipfs|ar):\/\/\S+\?img/g
  const imageLinks3 = text.match(imageRegex3)

  if (imageLinks3) {
    imageLinks = imageLinks.concat(imageLinks3)
  }

  if (!imageLinks) {
    return ''
  } else {
    for (let i = 0; i < imageLinks.length; i++) {
      if (imageLinks[i].startsWith('ar://')) {
        imageLinks[i] = imageLinks[i].replace('ar://', config.arweaveGateway)
      } else if (imageLinks[i].startsWith('ipfs://')) {
        imageLinks[i] = imageLinks[i].replace('ipfs://', 'https://ipfs.io/ipfs/')
      }
    }
  }

  return imageLinks[0]
}

export function getTextWithoutBlankCharacters(text) {
  //let strText = String(text).replace(zeroWidthCharacters, "⚠");
  let strText = String(text)

  if (strText.includes('\u0009')) {
    strText = strText.replace(/\u0009/g, '⚠')
  } else if (strText.includes('\u0020')) {
    strText = strText.replace(/\u0020/g, '⚠')
  } else if (strText.includes('\u00A0')) {
    strText = strText.replace(/\u00A0/g, '⚠')
  } else if (strText.includes('\u00AD')) {
    strText = strText.replace(/\u00AD/g, '⚠')
  } else if (strText.includes('\u034F')) {
    strText = strText.replace(/\u034F/g, '⚠')
  } else if (strText.includes('\u061C')) {
    strText = strText.replace(/\u061C/g, '⚠')
  } else if (strText.includes('\u115F')) {
    strText = strText.replace(/\u115F/g, '⚠')
  } else if (strText.includes('\u1160')) {
    strText = strText.replace(/\u1160/g, '⚠')
  } else if (strText.includes('\u17B4')) {
    strText = strText.replace(/\u17B4/g, '⚠')
  } else if (strText.includes('\u17B5')) {
    strText = strText.replace(/\u17B5/g, '⚠')
  } else if (strText.includes('\u180E')) {
    strText = strText.replace(/\u180E/g, '⚠')
  } else if (strText.includes('\u2000')) {
    strText = strText.replace(/\u2000/g, '⚠')
  } else if (strText.includes('\u2001')) {
    strText = strText.replace(/\u2001/g, '⚠')
  } else if (strText.includes('\u2002')) {
    strText = strText.replace(/\u2002/g, '⚠')
  } else if (strText.includes('\u2003')) {
    strText = strText.replace(/\u2003/g, '⚠')
  } else if (strText.includes('\u2004')) {
    strText = strText.replace(/\u2004/g, '⚠')
  } else if (strText.includes('\u2005')) {
    strText = strText.replace(/\u2005/g, '⚠')
  } else if (strText.includes('\u2006')) {
    strText = strText.replace(/\u2006/g, '⚠')
  } else if (strText.includes('\u2007')) {
    strText = strText.replace(/\u2007/g, '⚠')
  } else if (strText.includes('\u2008')) {
    strText = strText.replace(/\u2008/g, '⚠')
  } else if (strText.includes('\u2009')) {
    strText = strText.replace(/\u2009/g, '⚠')
  } else if (strText.includes('\u200A')) {
    strText = strText.replace(/\u200A/g, '⚠')
  } else if (strText.includes('\u200B')) {
    strText = strText.replace(/\u200B/g, '⚠')
  } else if (strText.includes('\u200C')) {
    strText = strText.replace(/\u200C/g, '⚠')
  } else if (strText.includes('\u200D')) {
    strText = strText.replace(/\u200D/g, '⚠')
  } else if (strText.includes('\u200E')) {
    strText = strText.replace(/\u200E/g, '⚠')
  } else if (strText.includes('\u200F')) {
    strText = strText.replace(/\u200F/g, '⚠')
  } else if (strText.includes('\u202F')) {
    strText = strText.replace(/\u202F/g, '⚠')
  } else if (strText.includes('\u205F')) {
    strText = strText.replace(/\u205F/g, '⚠')
  } else if (strText.includes('\u2028')) {
    strText = strText.replace(/\u2028/g, '⚠')
  } else if (strText.includes('\u205F')) {
    strText = strText.replace(/\u205F/g, '⚠')
  } else if (strText.includes('\u2060')) {
    strText = strText.replace(/\u2060/g, '⚠')
  } else if (strText.includes('\u2061')) {
    strText = strText.replace(/\u2061/g, '⚠')
  } else if (strText.includes('\u2062')) {
    strText = strText.replace(/\u2062/g, '⚠')
  } else if (strText.includes('\u2063')) {
    strText = strText.replace(/\u2063/g, '⚠')
  } else if (strText.includes('\u2064')) {
    strText = strText.replace(/\u2064/g, '⚠')
  } else if (strText.includes('\u206A')) {
    strText = strText.replace(/\u206A/g, '⚠')
  } else if (strText.includes('\u206B')) {
    strText = strText.replace(/\u206B/g, '⚠')
  } else if (strText.includes('\u206C')) {
    strText = strText.replace(/\u206C/g, '⚠')
  } else if (strText.includes('\u206D')) {
    strText = strText.replace(/\u206D/g, '⚠')
  } else if (strText.includes('\u206E')) {
    strText = strText.replace(/\u206E/g, '⚠')
  } else if (strText.includes('\u206F')) {
    strText = strText.replace(/\u206F/g, '⚠')
  } else if (strText.includes('\u2800')) {
    strText = strText.replace(/\u2800/g, '⚠')
  } else if (strText.includes('\u3000')) {
    strText = strText.replace(/\u3000/g, '⚠')
  } else if (strText.includes('\u3164')) {
    strText = strText.replace(/\u3164/g, '⚠')
  } else if (strText.includes('\uFEFF')) {
    strText = strText.replace(/\uFEFF/g, '⚠')
  } else if (strText.includes('\uFFA0')) {
    strText = strText.replace(/\uFFA0/g, '⚠')
  } else if (strText.includes('\uFFF9')) {
    strText = strText.replace(/\uFFF9/g, '⚠')
  } else if (strText.includes('\uFFFA')) {
    strText = strText.replace(/\uFFFA/g, '⚠')
  } else if (strText.includes('\u1D159')) {
    strText = strText.replace(/\u1D159/g, '⚠')
  } else if (strText.includes('\u1D173')) {
    strText = strText.replace(/\u1D173/g, '⚠')
  } else if (strText.includes('\u1D174')) {
    strText = strText.replace(/\u1D174/g, '⚠')
  } else if (strText.includes('\u1D175')) {
    strText = strText.replace(/\u1D175/g, '⚠')
  } else if (strText.includes('\u1D176')) {
    strText = strText.replace(/\u1D176/g, '⚠')
  } else if (strText.includes('\u1D177')) {
    strText = strText.replace(/\u1D177/g, '⚠')
  } else if (strText.includes('\u1D178')) {
    strText = strText.replace(/\u1D178/g, '⚠')
  } else if (strText.includes('\u1D179')) {
    strText = strText.replace(/\u1D179/g, '⚠')
  } else if (strText.includes('\u1D17A')) {
    strText = strText.replace(/\u1D17A/g, '⚠')
  }

  return strText
}

export function hasTextBlankCharacters(text) {
  let strText = String(text)

  /*
  if (isBlank(strText)) {
    return true;
  }
  */

  if (strText.includes('\u0009')) {
    return true
  } else if (strText.includes('\u0020')) {
    return true
  } else if (strText.includes('\u00A0')) {
    return true
  } else if (strText.includes('\u00AD')) {
    return true
  } else if (strText.includes('\u034F')) {
    return true
  } else if (strText.includes('\u061C')) {
    return true
  } else if (strText.includes('\u115F')) {
    return true
  } else if (strText.includes('\u1160')) {
    return true
  } else if (strText.includes('\u17B4')) {
    return true
  } else if (strText.includes('\u17B5')) {
    return true
  } else if (strText.includes('\u180E')) {
    return true
  } else if (strText.includes('\u2000')) {
    return true
  } else if (strText.includes('\u2001')) {
    return true
  } else if (strText.includes('\u2002')) {
    return true
  } else if (strText.includes('\u2003')) {
    return true
  } else if (strText.includes('\u2004')) {
    return true
  } else if (strText.includes('\u2005')) {
    return true
  } else if (strText.includes('\u2006')) {
    return true
  } else if (strText.includes('\u2007')) {
    return true
  } else if (strText.includes('\u2008')) {
    return true
  } else if (strText.includes('\u2009')) {
    return true
  } else if (strText.includes('\u200A')) {
    return true
  } else if (strText.includes('\u200B')) {
    return true
  } else if (strText.includes('\u200C')) {
    return true
  } else if (strText.includes('\u200D')) {
    return true
  } else if (strText.includes('\u200E')) {
    return true
  } else if (strText.includes('\u200F')) {
    return true
  } else if (strText.includes('\u202F')) {
    return true
  } else if (strText.includes('\u205F')) {
    return true
  } else if (strText.includes('\u2028')) {
    return true
  } else if (strText.includes('\u205F')) {
    return true
  } else if (strText.includes('\u2060')) {
    return true
  } else if (strText.includes('\u2061')) {
    return true
  } else if (strText.includes('\u2062')) {
    return true
  } else if (strText.includes('\u2063')) {
    return true
  } else if (strText.includes('\u2064')) {
    return true
  } else if (strText.includes('\u206A')) {
    return true
  } else if (strText.includes('\u206B')) {
    return true
  } else if (strText.includes('\u206C')) {
    return true
  } else if (strText.includes('\u206D')) {
    return true
  } else if (strText.includes('\u206E')) {
    return true
  } else if (strText.includes('\u206F')) {
    return true
  } else if (strText.includes('\u2800')) {
    return true
  } else if (strText.includes('\u3000')) {
    return true
  } else if (strText.includes('\u3164')) {
    return true
  } else if (strText.includes('\uFEFF')) {
    return true
  } else if (strText.includes('\uFFA0')) {
    return true
  } else if (strText.includes('\uFFF9')) {
    return true
  } else if (strText.includes('\uFFFA')) {
    return true
  } else if (strText.includes('\u1D159')) {
    return true
  } else if (strText.includes('\u1D173')) {
    return true
  } else if (strText.includes('\u1D174')) {
    return true
  } else if (strText.includes('\u1D175')) {
    return true
  } else if (strText.includes('\u1D176')) {
    return true
  } else if (strText.includes('\u1D177')) {
    return true
  } else if (strText.includes('\u1D178')) {
    return true
  } else if (strText.includes('\u1D179')) {
    return true
  } else if (strText.includes('\u1D17A')) {
    return true
  }

  return false
}

export function imgParsing(text) {
  const config = useRuntimeConfig()

  const imageRegex = /(?:https?:\/\/|ipfs:\/\/|ar:\/\/)(?:[^\/\s]+\/)+[^\s]+\.(?:jpe?g|gif|webp|png|img)/gi

  if (!imageRegex.test(text)) {
    return text
  }

  return text.replace(imageRegex, function (url) {
    let newUrl = url
    if (url.startsWith('ar://')) {
      newUrl = url.replace('ar://', config.arweaveGateway)
    } else if (url.startsWith('ipfs://')) {
      newUrl = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }

    return '<div></div><img class="img-fluid rounded" style="max-height: 500px;" src="' + newUrl + '" />'
  })
}

export function imgWithoutExtensionParsing(text) {
  const config = useRuntimeConfig()

  // if image doesn't have an extension, it won't be parsed by imgParsing
  // so we need to parse it here
  // but image link needs to end with "?.img" to be parsed (otherwise frontend will think it's a link)
  let imageRegex = /(http|https|ipfs|ar):\/\/\S+\?.img/

  if (!imageRegex.test(text)) {
    imageRegex = /(http|https|ipfs|ar):\/\/\S+\?img/

    if (!imageRegex.test(text)) {
      return text
    }
  }

  return text.replace(imageRegex, function (url) {
    if (url.startsWith('ar://')) {
      url = url.replace('ar://', config.arweaveGateway)
    } else if (url.startsWith('ipfs://')) {
      url = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }

    return '<img class="img-fluid rounded" style="max-height: 500px;" src="' + url + '" />'
  })
}

export function textLengthWithoutBlankCharacters(text) {
  return text
    .replace(/\s/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .trim().length
}

export function urlParsing(text) {
  const config = useRuntimeConfig()

  let urlRegex

  try {
    urlRegex = new RegExp(
      '(https?:\\/\\/|ipfs:\\/\\/|ar:\\/\\/)(?!.*\\.(jpg|png|jpeg|img|gif|webp|pdf|docx))[^\\s]+',
      'g',
    )
  } catch (error) {
    // fallback to simplified regex (without lookbehinds) in case of an old browser or Safari
    urlRegex = /(https?:\/\/|ipfs:\/\/|ar:\/\/)(?!.*\.(jpg|png|jpeg|img|gif|webp|pdf|docx))[^\s]+/g
  }

  if (!urlRegex.test(text)) {
    return text
  }

  return text.replace(urlRegex, function (url) {
    if (url.endsWith('?.img') || url.endsWith('?img') || url.endsWith('?.img"') || url.endsWith('?img"')) {
      // ignore urls ending with "?.img" beause they represent images (even though they don't have an image extension)
      return url
    }

    // remove this website referrals from the chat
    if (
      url.startsWith(window.location.origin) ||
      url.startsWith(String(window.location.origin).replace('https://', 'http://'))
    ) {
      if (url.includes('ref=')) {
        //url = url.replace("ref=", "noref="); // the easiest solution to not break a URL
        return '(referral links not allowed)'
      }
    }

    if (url.startsWith('https://www.youtube.com/embed/')) {
      // ignore youtube embeds
      return url
    } else if (url.endsWith('?.img') || url.endsWith('?img') || url.endsWith('?.img"') || url.endsWith('?img"')) {
      // ignore urls ending with "?.img" beause they represent images (even though they don't have an image extension)
      return url
    } else if (url.startsWith(config.projectUrl + '/nft/collection')) {
      // ignore collection links from our website
      return url
    }

    return '<a target="_blank" href="' + url + '">' + url + '</a>'
  })
}

export function youtubeParsing(text) {
  const ytRegex =
    /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/g

  if (!ytRegex.test(text)) {
    return text
  }

  return text.replace(ytRegex, function (url) {
    const videoId = url.match(
      /(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\/?\?v=|\/embed\/|\/)([^\s&\?\/\#]+)/,
    )[1]

    return (
      "<iframe class='rounded youtube-embed' width='100%' height='315' src='https://www.youtube.com/embed/" +
      videoId +
      "' frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe>"
    )
  })
}
