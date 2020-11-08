export enum HTTPMethods {
	'GET',
	'POST',
	'PUT',
	'DELETE',
	'OPTIONS',
	'HEAD',
	'PATCH',
	'TRACE',
	'CONNECT',
}

export const getHeaders = (
	methods: Array<HTTPMethods>,
	origin = 'https://d2tvnqhil9jwg2.cloudfront.net'
) => {
	return {
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': methods.join(', '),
	};
};
