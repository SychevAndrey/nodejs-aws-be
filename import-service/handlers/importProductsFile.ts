import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import * as AWS from "aws-sdk";
import Settings, { HEADERS } from "../constants";

export const importProductsFile: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const s3 = new AWS.S3({ region: Settings.awsRegion });
  const { name } = event.queryStringParameters;

  if (!name) {
    return {
      statusCode: 400,
      headers: HEADERS,
      body: JSON.stringify("Error: filename was not provided"),
    };
  }

  const params = {
    Bucket: Settings.bucketName,
    Key: `${Settings.src}/${name}`,
    ContentType: "text/csv",
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    console.log(url);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(url),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify("Internal Server Error"),
    };
  }
};
