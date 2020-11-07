import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';

const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  // Client uses default environment variables.
  // See https://node-postgres.com/features/connecting for details
  const client = new Client({ ssl: { rejectUnauthorized: false } });
  const response = {
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      error: 'Unknown',
    }),
  };

  console.log({
    pathParams: event.pathParameters,
    queryParams: event.queryStringParameters,
  });

  try {
    const { productId } = event.pathParameters;

    if (
      !productId ||
      !productId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    ) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: 'Invalid ID' });
    } else {
      client.connect();

      const {
        rows: [foundItem],
      } = await client.query(
        'select p.*, s.count from products p join stocks s on s.product_id = p.id where p.id = $1',
        [productId]
      );
      console.log(foundItem);

      if (!foundItem) {
        response.statusCode = 404;
        response.body = JSON.stringify({ error: 'Product was not found' });
      } else {
        response.body = JSON.stringify(foundItem);
        response.statusCode = 200;
      }
    }
  } catch (error) {
    response.body = JSON.stringify({ error });
  } finally {
    client.end();
  }
  console.log(response);
  return response;
};

export default getProductById;
