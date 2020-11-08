import "source-map-support/register";

export enum HTTPMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  PATCH = "PATCH",
  TRACE = "TRACE",
  CONNECT = "CONNECT",
}

export const getHeaders = (
  methods: Array<HTTPMethods>,
  origin = "https://d2tvnqhil9jwg2.cloudfront.net"
) => {
  return {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": methods.join(", "),
  };
};
