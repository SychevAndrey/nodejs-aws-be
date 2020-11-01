import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import productList from '../productList.json';

export const getProduct: APIGatewayProxyHandler = async (event, _context) => {
	const { productId } = event.pathParameters;
	const product = productList.find(
		({ id }) => event.pathParameters.productId === id
	);

	if (product !== null || product !== undefined) {
		return {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Origin': 'https://d2tvnqhil9jwg2.cloudfront.net',
				'Access-Control-Allow-Methods': 'GET',
			},
			body: JSON.stringify(product, null, 2),
		};
	}
	return {
		statusCode: 400,
		headers: {
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Allow-Origin': 'https://d2tvnqhil9jwg2.cloudfront.net',
			'Access-Control-Allow-Methods': 'GET',
		},
		body: JSON.stringify(`Product with ID:${productId} is not found`, null, 2),
	};
};
