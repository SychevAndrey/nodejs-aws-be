import { APIGatewayProxyHandler } from "aws-lambda";
import { HTTPMethods, getHeaders } from "../utils/response-headers";
import { Client } from "pg";
import dbOptions from "../db/options";

export const createProduct: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  const { body } = event;
  const client = new Client(dbOptions);
  await client.connect();

  try {
    const { title, description, price, count } = JSON.parse(body);

    await client.query("BEGIN");

    const queryResult = await client.query(`
      insert into products (title, description, price) values ($1, $2, $3) returning *`, [title, description, price]);
    const product = queryResult.rows[0];

    await client.query(
      `insert into stocks (product_id, count) values ($1, $2)`,
      [product.id, count]
    );

    await client.query("COMMIT");

    return {
      statusCode: 200,
      headers: getHeaders([HTTPMethods.GET, HTTPMethods.POST], "*"),
      body: JSON.stringify(
        {
          message: `Product was successfully created with id ${product.id}`,
        },
        null,
        2
      ),
    };
  } catch (error) {
    await client.query("ROLLBACK");

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Error during database request executing with`,
        error: error,
      }),
    };
  } finally {
    await client.end();
  }
};
