import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

const getProductsList: APIGatewayProxyHandler = async () => {
  try {
    const productsData = await axios
      .get('http://fake-product-data.s3-website-eu-west-1.amazonaws.com/')
      .then((res) => res.data);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(productsData),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Internal server error: ' + JSON.stringify(error),
    };
  }
};

export default getProductsList;
