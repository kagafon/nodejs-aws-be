import importProductsFile from '../../handlers/importProductsFile';
import * as AWSMock from 'aws-sdk-mock';
import { APIGatewayProxyEvent } from 'aws-lambda';

test('Import file: get signed URL', async () => {
  const testString = Math.round(Math.random() * 1000000000).toString(36);
  const event: APIGatewayProxyEvent = {
    queryStringParameters: { name: testString },
    body: null,
    headers: null,
    multiValueHeaders: null,
    httpMethod: null,
    multiValueQueryStringParameters: null,
    isBase64Encoded: null,
    path: null,
    pathParameters: null,
    requestContext: null,
    resource: null,
    stageVariables: null,
  };

  AWSMock.mock('S3', 'getSignedUrl', testString);

  expect.assertions(1);
  const response = await importProductsFile(event, null, null);
  
  expect(response).toEqual(
    expect.objectContaining({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        data: testString,
      }),
    })
  );
});
