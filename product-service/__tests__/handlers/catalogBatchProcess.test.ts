import { SQSEvent } from 'aws-lambda';
import * as AWSMock from 'aws-sdk-mock';
import { SNS } from 'aws-sdk';
import { Client } from 'pg';

import catalogBatchProcess from '../../handlers/catalogBatchProcess';

const testRecords = [
  {
    body: JSON.stringify({
      title: 'Test',
      description: 'Test description',
      price: '10.1',
      count: '12',
    }),
  },
  {
    body: JSON.stringify({
      title: 'Test 2',
      description: 'Test description 2',
      price: '17.2',
      count: '19',
    }),
  },
];

const publishFn = jest.fn((_: SNS.PublishInput, callback) => {
  callback();
});

AWSMock.mock('SNS', 'publish', publishFn);

jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(() => ({
      rows: [{ id: 'test-id' }],
    })),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

test('Batch products creation', async () => {
  const client = new Client();

  expect.assertions(5);

  const response = await catalogBatchProcess({
    Records: testRecords,
  } as SQSEvent);

  expect(response).toEqual(
    expect.objectContaining({
      statusCode: 202,
    })
  );
  expect(client.connect).toBeCalledTimes(1);
  expect(client.query).toBeCalledTimes(2 * testRecords.length + 2);
  expect(client.end).toBeCalledTimes(1);
  expect(publishFn).toBeCalledTimes(1);
});
