const { fetchMetadata } = require('../../utils/linkPreviewUtils');

exports.handler = async function (event, context) {
  const url = event.queryStringParameters.url;

  const { metadata, status } = await fetchMetadata(url);

  return {
    statusCode: status,
    body: JSON.stringify({ data: metadata }),
  };
  
};
