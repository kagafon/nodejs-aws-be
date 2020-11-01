import axios from 'axios';
import getProductById from '../../handlers/getProductById';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

test('Get product by Id', async () => {
  const resp = {
    count: 4,
    description: 'Most equal square',
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
    price: 2.4,
    title: 'Square',
    imageUrl: '/assets/images/Square.svg',
  };
  mockedAxios.get.mockResolvedValue({ data: [resp] });

  expect.assertions(2);
  const response = await getProductById(
    {
      body: '',
      resource: '',
      headers: {},
      pathParameters: { productId: resp.id },
      multiValueHeaders: {},
      httpMethod: 'GET',
      queryStringParameters: {},
      isBase64Encoded: false,
      multiValueQueryStringParameters: {},
      path: `/product/${resp.id}`,
      requestContext: null,
      stageVariables: null,
    },
    null,
    null
  );

  expect(response).toEqual(
    expect.objectContaining({
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  );

  expect(JSON.parse(response['body'])).toEqual(resp);
});
