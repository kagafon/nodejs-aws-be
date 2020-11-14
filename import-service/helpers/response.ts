interface GatewayResponse {
  statusCode: number;
  body: object;
}

const shapeResponse = (response: GatewayResponse) => {
  return {
    statusCode: response.statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(response.body),
  };
};

export { shapeResponse, GatewayResponse };
