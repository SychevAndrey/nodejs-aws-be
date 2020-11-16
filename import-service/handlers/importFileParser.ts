import { S3Event, S3Handler } from "aws-lambda";
import "source-map-support/register";
import * as AWS from "aws-sdk";
import csv from "csv-parser";
import util from "util";
import stream from "stream";
import SETTINGS from "../constants";

export const importFileParser: S3Handler = async (event: S3Event) => {
  const s3 = new AWS.S3({ region: SETTINGS.awsRegion });
  const pipeline = util.promisify(stream.pipeline);

  for (const record of event.Records) {
    try {
      const s3Stream = s3
        .getObject({
          Bucket: SETTINGS.bucketName,
          Key: record.s3.object.key,
        })
        .createReadStream();

      await pipeline(s3Stream, csv());

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
