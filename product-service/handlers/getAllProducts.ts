import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Client } from "pg";
import dbOptions from "../db/options";
import { getHeaders, HTTPMethods } from "../utils/response-headers";

export const getAllProducts: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const client = new Client(dbOptions);
  await client.connect();

  try {
    const queryResult = await client.query(
      `select * from products p inner join stocks s on s.product_id = p.id`
    );

    return {
      statusCode: 200,
      headers: getHeaders([HTTPMethods.GET]),
      body: JSON.stringify(
        {
          products: queryResult.rows,
          input: event,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return { statusCode: 500, body: "Error during database request executing" };
  } finally {
    client.end();
  }
};
