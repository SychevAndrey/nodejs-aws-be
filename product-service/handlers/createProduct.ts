import { APIGatewayProxyHandler } from "aws-lambda";
import { HTTPMethods, getHeaders } from "../utils/response-headers";
import { Client } from "pg";
import dbOptions from "../db/options";

export const createProduct: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const { body, httpMethod } = event;
  let product;

  if (httpMethod !== HTTPMethods.POST) {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const client = new Client(dbOptions);
  await client.connect();

  try {
    const data = JSON.parse(body);
    const { title, description, price, count } = data;
    const queryResult = await client.query(`
      insert into products (title, description, price) values
      ('${title}', '${description}', ${price}) returning *`);

    product = queryResult.rows[0];

    await client.query(
      `insert into stocks (product_id, count) values ('${product.id}', ${count})`
    );

    return {
      statusCode: 200,
      headers: getHeaders([HTTPMethods.GET, HTTPMethods.POST], "*"),
      body: JSON.stringify(
        {
          message: `Product was successfully created with id ${product.id}`,
          input: event,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Error during database request executing with`,
        error: error,
        input: event.body,
      }),
    };
  } finally {
    client.end();
  }
};
