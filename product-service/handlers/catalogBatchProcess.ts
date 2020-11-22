import { SQSEvent } from 'aws-lambda';
import { Client } from 'pg';
import { SNS } from 'aws-sdk';

const catalogBatchProcess = async (
  event: SQSEvent
): Promise<{ statusCode: number }> => {
  const sns = new SNS({ region: 'eu-west-1' });
  const client = new Client({ ssl: { rejectUnauthorized: false } });
  client.connect();

  try {
    await client.query('BEGIN');
    let maxProductPrice = -1;

    for (const record of event.Records) {
      const { title, description, price, count } = JSON.parse(record.body);
      const priceAsNum = +price;
      const countAsNum = +count;
      if (
        !title ||
        !description ||
        Number.isNaN(priceAsNum) ||
        Number.isNaN(countAsNum) ||
        Math.round(countAsNum) !== countAsNum
      ) {
        console.log(
          `Wrong params: ${JSON.stringify({
            title,
            description,
            price,
            count,
            priceAsNum,
            countAsNum,
          })}`
        );
      } else {
        const {
          rows: [insertedProduct],
        } = await client.query(
          'insert into products(title, description, price) values ($1, $2, $3) RETURNING *',
          [title, description, priceAsNum]
        );

        await client.query(
          'insert into stocks(product_id, count) values ($1, $2)',
          [insertedProduct['id'], countAsNum]
        );
      }
      if (maxProductPrice < priceAsNum) {
        maxProductPrice = priceAsNum;
      }
    }
    await client.query('COMMIT');
    if (event.Records.length) {
      await sns
        .publish({
          Subject: 'Products loaded',
          Message: `Loaded products: ${event.Records.length} (maxPrice: ${maxProductPrice})`,
          MessageAttributes: {
            maxProductPrice: {
              DataType: 'Number',
              StringValue: maxProductPrice.toFixed(0),
            },
          },
          TopicArn: process.env.SNS_ARN,
        })
        .promise();
    }
    return { statusCode: 202 };
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
  } finally {
    client.end();
  }
};

export default catalogBatchProcess;
