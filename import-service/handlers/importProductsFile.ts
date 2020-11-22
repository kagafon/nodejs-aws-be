import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { shapeResponse, GatewayResponse } from '../helpers/response';

const importProductsFile: APIGatewayProxyHandler = async (event, _context) => {
  const response: GatewayResponse = {
    statusCode: 500,
    body: {
      error: 'Unknown',
    },
  };

  try {
    const { name } = event.queryStringParameters;
    const s3 = new S3({ region: 'eu-west-1' });
    const signedUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: 'kagafon-import',
      Key: `uploaded/${name}`,
      Expires: 600,
      ContentType: 'text/csv',
    });

    response.body = { url: signedUrl };
    response.statusCode = 200;
  } catch (error) {
    response.body = { error };
  }
  return shapeResponse(response);
};

export default importProductsFile;
