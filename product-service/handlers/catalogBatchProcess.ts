import { SNS } from 'aws-sdk';
import { APIGatewayProxyHandler } from "aws-lambda";
import { HTTPMethods, getHeaders } from "../utils/response-headers";
import { Client } from "pg";
import dbOptions from "../db/options";

export const catalogBatchProcess = async(event) => {
  const sns = new SNS({region: 'eu-west-1'});
  const client = new Client(dbOptions);
  await client.connect();

  const tasks = event.Records.map(async ({ body }) => {
    try {
      const { title, description, price, count } = JSON.parse(body);

      if (!title || !description || price < 0 || count < 0) {
        throw new Error(`Invalid data provided: ${body}`);
      }
      await client.query("BEGIN");

      const queryResult = await client.query(`
        insert into products (title, description, price) values
        ($1, $2, $3) returning *`, [title, description, price]);
      const product = queryResult.rows[0];

      await client.query(
        `insert into stocks (product_id, count) values ($1, $2)`, [product.id, count]
    );

      await client.query("COMMIT");
      console.log(`Product was successfully created with id ${product.id}`);
      return product;
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Product creation error: ${error}`);
    } finally {
        await client.end();
    }
  })

  const result = await Promise.all(tasks);

  if (result.filter(Boolean).length) {
    await sns.publish({
      Subject: 'Products created',
      Message: JSON.stringify(result),
      TopicArn: process.env.SNS_ARN,
    }, (error) => {
      if (error) console.error(error);
    }).promise();
  }
};