const ImageKit = require('imagekit')

exports.handler = async function (event, context) {
  try {
    const imagekit = new ImageKit({
      urlEndpoint: process.env.IMAGEKIT_ENDPOINT,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ data: imagekit.getAuthenticationParameters() }),
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
}
