import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import productList from "../productList.json";
import { getHeaders, HTTPMethods } from "../utils/response-headers";

export const getAllProducts: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  function getAsync() {
    return new Promise((resolve) => setTimeout(() => resolve(productList), 0));
  }

  return {
    statusCode: 200,
    headers: getHeaders([HTTPMethods.GET]),
    body: JSON.stringify(
      {
        products: await getAsync(),
        input: event,
      },
      null,
      2
    ),
  };
};
