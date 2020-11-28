import { APIGatewayTokenAuthorizerHandler, PolicyDocument } from 'aws-lambda';

const basicAuthorizer: APIGatewayTokenAuthorizerHandler = async (event) => {

  if (event.type !== 'TOKEN')
    throw 'Unauthorized';

  try {
    const principalId = event.authorizationToken.split(' ')[1];

    const [username, password] = Buffer.from(principalId, 'base64').toString('utf-8').split(':');
    return {
      principalId,
      policyDocument: createPolicy(event.methodArn, process.env[username] && process.env[username] === password ? 'Allow' : 'Deny'),
    };
    }
    catch(e){
      console.log(e);
      throw `Unauthorized`;
    }

};

const createPolicy: (resourceArn: string, effect: string) => PolicyDocument = (
  resourceArn,
  effect
) => {
  return {
    Version: '2012-10-17',
    Statement: [
      { Effect: effect, Resource: resourceArn, Action: 'execute-api:Invoke' },
    ],
  };
};

export default basicAuthorizer;
