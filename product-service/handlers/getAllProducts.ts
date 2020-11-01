import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import productList from '../productList.json';

export const getAllProducts: APIGatewayProxyHandler = async (
	event,
	_context
) => {
	function getAsync() {
		return new Promise((resolve) => setTimeout(() => resolve(productList), 0));
	}

	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Allow-Origin': 'https://d2tvnqhil9jwg2.cloudfront.net',
			'Access-Control-Allow-Methods': 'GET',
		},
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
