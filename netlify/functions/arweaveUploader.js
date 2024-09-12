const Arweave = require('arweave');
const { Buffer } = require('buffer');

exports.handler = async (event, context) => {
  // Check if the request method is POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the incoming request body
    const { fileData, fileName, fileType } = JSON.parse(event.body);

    // Initialize Arweave
    const arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });

    // Construct the key file object from environment variables
    const keyFile = {
      kty: process.env.ARWEAVE_KTY,
      n: process.env.ARWEAVE_N,
      e: process.env.ARWEAVE_E,
      d: process.env.ARWEAVE_D,
      p: process.env.ARWEAVE_P,
      q: process.env.ARWEAVE_Q,
      dp: process.env.ARWEAVE_DP,
      dq: process.env.ARWEAVE_DQ,
      qi: process.env.ARWEAVE_QI
    };

    // Convert base64 file data to buffer
    const fileBuffer = Buffer.from(fileData, 'base64');

    // Create a transaction
    const transaction = await arweave.createTransaction({ data: fileBuffer }, keyFile);

    // Add tags to the transaction
    transaction.addTag('Content-Type', fileType);
    transaction.addTag('File-Name', fileName);

    // Sign the transaction
    await arweave.transactions.sign(transaction, keyFile);

    // Submit the transaction
    const response = await arweave.transactions.post(transaction);

    if (response.status === 200) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'File uploaded successfully',
          transactionId: transaction.id
        })
      };
    } else {
      throw new Error('Failed to upload file to Arweave');
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
