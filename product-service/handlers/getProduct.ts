import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import productList from "../productList.json";
import { getHeaders, HTTPMethods } from "../utils/response-headers";

export const getProduct: APIGatewayProxyHandler = async (event, _context) => {
  const productId = event.pathParameters?.productId;
  const product = productList.find(({ id }) => productId === id);

  if (!product) {
    return {
      statusCode: 404,
      headers: getHeaders([HTTPMethods.GET]),
      body: JSON.stringify(`Product with ID:${productId} is not found`),
    };
  }
  return {
    statusCode: 200,
    headers: getHeaders([HTTPMethods.GET]),
    body: JSON.stringify(product, null, 2),
  };
};
