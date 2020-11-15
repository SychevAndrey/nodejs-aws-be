import type { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "product-service",
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: "2",
  custom: {
    bundle: {
      tsConfig: "tsconfig.json",
      sourcemaps: true,
      ignorePackages: ["pg-native"],
    },
  },
  // Add the serverless-bundle plugin
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
  },
};

module.exports = serverlessConfiguration;
