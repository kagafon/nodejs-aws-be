import axios from 'axios';
import getProductsList from '../../handlers/getProductsList';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

test('Get product list', async () => {
  const resp = [
    {
      count: 4,
      description: 'Most equal square',
      id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
      price: 2.4,
      title: 'Square',
      imageUrl: '/assets/images/Square.svg',
    },
  ];
  mockedAxios.get.mockResolvedValue({ data: resp });

  expect.assertions(2);
  const response = await getProductsList(null, null, null);

  expect(response).toEqual(
    expect.objectContaining({
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  );

  expect(Array.isArray(JSON.parse(response['body']))).toEqual(true);
});

