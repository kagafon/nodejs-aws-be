import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
  },

  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: {
        forceExclude: 'aws-sdk',
      },
    },
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      IMPORT_SQS:
        '${cf:product-service-${self:provider.stage}.catalogItemsQueueUrl}',
      IMPORT_BUCKET: 'kagafon-import',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: 'arn:aws:s3:::kagafon-import/*',
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource:
          '${cf:product-service-${self:provider.stage}.catalogItemsQueueArn}',
      },
    ],
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
            authorizer: {
              name: 'basicTokenAuthorizer',
              arn:
                '${cf:authorization-service-${self:provider.stage}.basicAuthorizerArn}',
              type: 'token',
              identitySource: 'method.request.header.Authorization',
            },
          },
        },
      ],
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            event: 's3:ObjectCreated:*',
            bucket: 'kagafon-import',
            rules: [{ prefix: 'uploaded/', suffix: '.csv' }],
            existing: true,
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      GatewayResponseAccessDenied: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          RestApiId: { Ref: 'ApiGatewayRestApi' },
          ResponseType: 'ACCESS_DENIED',
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Credentials': "'true'",
          },
        },
      },
      GatewayResponseUnauthorized: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          RestApiId: { Ref: 'ApiGatewayRestApi' },
          ResponseType: 'UNAUTHORIZED',
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Credentials': "'true'",
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
