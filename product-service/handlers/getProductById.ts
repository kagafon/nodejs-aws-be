import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const { productId } = event.pathParameters;
    const productsData = await axios
      .get('http://fake-product-data.s3-website-eu-west-1.amazonaws.com/')
      .then((res) => res.data);

    const foundItem = productsData.find((x) => x.id === productId);
    if (!foundItem) {
      return {
        statusCode: 404,
        body: 'Not found',
      };
    }
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(foundItem),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Internal server error: ' + JSON.stringify(error),
    };
  }
};

export default getProductById;
