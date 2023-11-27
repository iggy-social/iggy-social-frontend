const { SpheronClient, ProtocolEnum } = require("@spheron/storage");

export default async function handler(request, response) {
  try {
    const bucketName = process.env.SPHERON_BUCKET_NAME; // enter bucket name in environment variables
    const token = process.env.SPHERON_STORAGE_TOKEN; // add spheron storage token in environment variables
    
    const protocol = ProtocolEnum.IPFS;
 
    const client = new SpheronClient({ token });
 
    const { uploadToken } = await client.createSingleUploadToken({
      name: bucketName,
      protocol,
    });
    
    return response.status(200).json({
      data: uploadToken
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
}