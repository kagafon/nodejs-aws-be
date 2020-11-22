import { S3Event } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk';
import parse from 'csv-parser';

const importFileParser = async (
  event: S3Event
): Promise<{ statusCode: number }> => {
  try {
    const s3 = new S3({ region: 'eu-west-1' });
    const sqs = new SQS({ region: 'eu-west-1' });

    const parser = parse({
      separator: ';',
    });

    for (const record of event.Records) {
      await new Promise((resolve) =>
        s3
          .getObject({
            Bucket: process.env.IMPORT_BUCKET,
            Key: record.s3.object.key,
          })
          .createReadStream()
          .pipe(
            parser
              .on('readable', () => {
                try {
                  let record = parser.read();
                  while (record) {
                    console.log(record);
                    console.log(process.env.IMPORT_SQS);
                    sqs.sendMessage(
                      {
                        QueueUrl: process.env.IMPORT_SQS,
                        MessageBody: JSON.stringify(record),
                      },
                      (err, sendMessageResult) => {
                        console.log({ err, sendMessageResult });
                      }
                    );
                    record = parser.read();
                  }
                } catch (error) {
                  console.log(error);
                }
              })
              .on('end', async () => {
                await s3
                  .copyObject({
                    Bucket: process.env.IMPORT_BUCKET,
                    CopySource: `${process.env.IMPORT_BUCKET}/${record.s3.object.key}`,
                    Key: record.s3.object.key.replace('uploaded/', 'parsed/'),
                  })
                  .promise();
                await s3
                  .deleteObject({
                    Bucket: process.env.IMPORT_BUCKET,
                    Key: record.s3.object.key,
                  })
                  .promise();
                resolve();
              })
          )
      );
    }
  } catch (error) {
    console.log(error);
  }
  return { statusCode: 202 };
};

export default importFileParser;
