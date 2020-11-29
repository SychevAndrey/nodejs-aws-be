import { S3Event, S3Handler } from "aws-lambda";
import "source-map-support/register";
import { SQS, S3 } from "aws-sdk";
import csv from "csv-parser";
import util from "util";
import stream from "stream";
import SETTINGS from "../constants";

class SendToSQS extends stream.Transform {
  constructor( private sqs:SQS) {
    super({objectMode: true});
  }

  _transform(record, _enc, callback) {
    this.sqs.sendMessage({
        QueueUrl: process.env.SQS_URL,
        MessageBody: JSON.stringify(record),
    }, (error, result) => {
        if (error) {
          console.error(error);
        }
        console.log(result);
    })
    callback(null, record);
  }
}

export const importFileParser: S3Handler = async (event: S3Event) => {
  const s3 = new S3({ region: SETTINGS.awsRegion });
  const sqs = new SQS();
  const pipeline = util.promisify(stream.pipeline);

  for (const record of event.Records) {
    try {
      const s3Stream = s3
        .getObject({
          Bucket: SETTINGS.bucketName,
          Key: record.s3.object.key,
        })
        .createReadStream();

      await pipeline(s3Stream, csv(), new SendToSQS(sqs));

      const key = record.s3.object.key.replace(SETTINGS.src, SETTINGS.dist);

      await s3
        .copyObject({
          Bucket: SETTINGS.bucketName,
          CopySource: `${SETTINGS.bucketName}/${record.s3.object.key}`,
          Key: key,
        })
        .promise();

      await s3
        .deleteObject({
          Bucket: SETTINGS.bucketName,
          Key: record.s3.object.key,
        })
        .promise();
    } catch (e) {
      console.error(e);
    }
  }
  return;
};
