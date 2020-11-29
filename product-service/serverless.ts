import type { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "product-service",
  },
  frameworkVersion: "2",
  custom: {
    bundle: {
      tsConfig: "tsconfig.json",
      sourcemaps: true,
      ignorePackages: ["pg-native"],
    },
  },
  plugins: ["serverless-bundle", "serverless-dotenv-plugin"],
  provider: {
    name: "aws",
    region: "eu-west-1",
    stage: "dev",
    runtime: "nodejs12.x",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      PG_HOST: "${env:PG_HOST}",
      PG_PORT: "${env:PG_PORT}",
      PG_DATABASE: "${env:PG_DB}",
      PG_USERNAME: "${env:PG_USER}",
      PG_PASSWORD: "${env:PG_PASS}",
      SQS_QUEUE: "catalogItemsQueue",
      SNS_TOPIC: "createProductTopic",
      SNS_ARN: {
        Ref: "SNSTopic",
      },
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: [
          {
            "Fn::GetAtt": ["SQSQueue", "Arn"],
          },
        ],
      },
      {
        Effect: "Allow",
        Action: "sns:*",
        Resource: [
          {
            Ref: "SNSTopic",
          },
        ],
      },
    ],
  },
  resources: {
    Outputs: {
      SQSUrl: {
        Value: {
          Ref: "SQSQueue",
        },
      },
      SQSArn: {
        Value: {
          "Fn::GetAtt": ["SQSQueue", "Arn"],
        },
      },
    },
    Resources: {
      SQSQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${self:provider.environment.SQS_QUEUE}",
        },
      },
      SNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "${self:provider.environment.SNS_TOPIC}",
        },
      },
      SNSSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "${env:SNS_EMAIL}",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
        },
      },
    },
  },
  functions: {
    getAllProducts: {
      handler: "handler.getAllProducts",
      events: [
        {
          http: {
            method: "get",
            path: "products",
          },
        },
      ],
    },
    getProduct: {
      handler: "handler.getProduct",
      events: [
        {
          http: {
            method: "get",
            path: "products/{productId}",
          },
        },
      ],
    },
    createProduct: {
      handler: "handler.createProduct",
      events: [
        {
          http: {
            method: "post",
            path: "products",
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: "handler.catalogBatchProcess",
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              "Fn::GetAtt": ["SQSQueue", "Arn"],
            },
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
