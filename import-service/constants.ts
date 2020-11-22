const SETTINGS = {
  bucketName: "import-service-aws-bucket",
  awsRegion: "eu-west-1",
  src: "uploaded",
  dist: "parsed",
};

export const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Origin": "*",
};

export default SETTINGS;
