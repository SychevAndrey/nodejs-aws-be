import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Client } from "pg";
import dbOptions from "../db/options";
import { getHeaders, HTTPMethods } from "../utils/response-headers";

export const getProduct: APIGatewayProxyHandler = async (event, _context) => {
  const productId = event.pathParameters?.productId;
  const client = new Client(dbOptions);
  await client.connect();

  try {
    const queryResult = await client.query(
      `select * from products p inner join stocks s on s.product_id = p.id where p.id = '${productId}'`
    );

    if (queryResult.rowCount > 0) {
      return {
        statusCode: 200,
        headers: getHeaders([HTTPMethods.GET]),
        body: JSON.stringify(
          {
            product: queryResult.rows[0],
            input: event,
          },
          null,
          2
        ),
      };
    }

    return {
      statusCode: 404,
      headers: getHeaders([HTTPMethods.GET]),
      body: JSON.stringify(`Product with ID:${productId} is not found`),
    };
  } catch (error) {
    return { statusCode: 500, body: "Error during database request executing" };
  } finally {
    client.end();
  }
};
