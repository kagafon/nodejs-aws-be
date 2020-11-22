import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
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
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
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
      PGHOST: '${env:PG_HOST}',
      PGDATABASE: '${env:PG_DB}',
      PGUSER: '${env:PG_USER}',
      PGPASSWORD: '${env:PG_PWD}',
      SNS_ARN: { Ref: 'createProductTopic' },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: { Ref: 'createProductTopic' },
      },
    ],
  },
  functions: {
    getProductsList: {
      handler: 'handler.getProductsList',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    getProductById: {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{productId}',
            request: { parameters: { paths: { productId: true } } },
            cors: true,
          },
        },
      ],
    },
    addProduct: {
      handler: 'handler.addProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            arn: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
            batchSize: 5,
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'kagafon-import-products-sqs-queue',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'kagafon-product-import-sns-topic',
        },
      },
      defaultCreateProductSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: 'fallyn1@puttingpv.com',
          TopicArn: {
            Ref: 'createProductTopic',
          },
        },
      },
      nonDefaultCreateProductSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Protocol: 'email',
          Endpoint: 'kaedan.17@puttingpv.com',
          TopicArn: {
            Ref: 'createProductTopic',
          },
          FilterPolicy: {
            maxProductPrice: [{ numeric: ['>', 10] }],
          },
        },
      },
    },
    Outputs: {
      catalogItemsQueueArn: {
        Value: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
      },
      catalogItemsQueueUrl: {
        Value: { Ref: 'catalogItemsQueue' },
      },
    },
  },
};

module.exports = serverlessConfiguration;
