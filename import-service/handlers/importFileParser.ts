import { S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import parse from 'csv-parser';

const BUCKET = 'kagafon-import';

const importFileParser = async (
  event: S3Event
): Promise<{ statusCode: number }> => {
  try {
    const s3 = new S3({ region: 'eu-west-1' });
    const parser = parse({
      separator: ';',
    });

    for (const record of event.Records) {
      await new Promise((resolve) =>
        s3
          .getObject({ Bucket: BUCKET, Key: record.s3.object.key })
          .createReadStream()
          .pipe(
            parser
              .on('readable', () => {
                try {
                  let record = parser.read();
                  while (record) {
                    console.log(record);
                    record = parser.read();
                  }
                } catch (error) {
                  console.log(error);
                }
              })
              .on('end', async () => {
                await s3
                  .copyObject({
                    Bucket: BUCKET,
                    CopySource: `${BUCKET}/${record.s3.object.key}`,
                    Key: record.s3.object.key.replace('uploaded/', 'parsed/'),
                  })
                  .promise();
                await s3
                  .deleteObject({
                    Bucket: BUCKET,
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
