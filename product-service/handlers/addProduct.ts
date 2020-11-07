import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';

const addProduct: APIGatewayProxyHandler = async (event, _context) => {
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
    /* Validate incoming params */
    const { title, description, price, count } = JSON.parse(event.body);

    if (
      !title ||
      !description ||
      Number.isNaN(price) ||
      Number.isNaN(count) ||
      Math.round(count) !== count
    ) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: 'Invalid params' });
    } else {
      client.connect();
      /* Use transaction */
      await client.query('BEGIN');
      const {
        rows: [insertedProduct],
      } = await client.query(
        'insert into products(title, description, price) values ($1, $2, $3) RETURNING *',
        [title, description, price]
      );

      await client.query(
        'insert into stocks(product_id, count) values ($1, $2)',
        [insertedProduct['id'], count]
      );

      await client.query('COMMIT');
      response.body = JSON.stringify({ ...insertedProduct, count });
      response.statusCode = 200;
    }
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {}
    response.body = JSON.stringify({ error });
  } finally {
    client.end();
  }
  return response;
};

export default addProduct;
