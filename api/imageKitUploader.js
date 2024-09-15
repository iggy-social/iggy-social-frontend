const ImageKit = require('imagekit')

export default async function handler(request, response) {
  try {
    const imagekit = new ImageKit({
      urlEndpoint: process.env.IMAGEKIT_ENDPOINT,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    })

    return response.status(200).json({
      data: imagekit.getAuthenticationParameters(),
    })
  } catch (error) {
    console.error(error)
    next(error)
  }
}
