const { fetchMetadata } = require('../utils/linkPreviewUtils');

export default async function handler(request, response) {
  const url = request.query.url;

  const { metadata, status } = await fetchMetadata(url);

  return response.status(status).json({
    data: metadata
  });
  
};