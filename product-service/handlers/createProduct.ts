import { APIGatewayProxyHandler } from "aws-lambda";
import { HTTPMethods, getHeaders } from "../utils/response-headers";
import { Client } from "pg";
import dbOptions from "../db/options";

export const createProduct: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const { body, httpMethod } = event;

  if (httpMethod !== HTTPMethods.POST) {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const client = new Client(dbOptions);
  await client.connect();

  try {
    const { title, description, price, count } = JSON.parse(body);

    const productId = await client.query(`
      insert into products (title, description, price) values
      (${title}, ${description}, ${price}) returning id`);

    await client.query(
      `insert into stocks (product_id, count) values (${productId}, ${count})`
    );

    return {
      statusCode: 200,
      headers: getHeaders([HTTPMethods.GET]),
      body: JSON.stringify(
        {
          message: `Product was successfully created with id ${productId}`,
          input: event,
        },
        null,
        2
      ),
    };
  } catch {
    return { statusCode: 500, body: "Error during database request executing" };
  } finally {
    client.end();
  }
};
