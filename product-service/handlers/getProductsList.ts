import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';

const getProductsList: APIGatewayProxyHandler = async (event) => {
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

  console.log({ event });

  try {
    client.connect();

    const { rows: productsData } = await client.query(
      'select p.*, s.count from products p join stocks s on s.product_id = p.id'
    );
    response.body = JSON.stringify(productsData);
    response.statusCode = 200;
  } catch (error) {
    response.body = JSON.stringify({ error });
  } finally {
    client.end();
  }
  return response;
};

export default getProductsList;
