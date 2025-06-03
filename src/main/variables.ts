import env from 'env-var'

function parseApiRoutes(): Array<{ path: string; method: string }> {
  const raw = env.get('API_ROUTES').required().asJsonArray()

  if (!Array.isArray(raw)) {
    throw new Error('API_ROUTES deve ser um array JSON.')
  }

  for (const route of raw) {
    if (
      typeof route !== 'object' ||
      typeof route.path !== 'string' ||
      typeof route.method !== 'string'
    ) {
      throw new Error(
        'Cada rota em API_ROUTES deve ser um objeto com "path" e "method" como strings.'
      )
    }
  }

  return raw as Array<{ path: string; method: string }>
}

export const variables = {
  tz: env.get('TZ').required().asString(),
  awsRegion: env.get('AWS_REGION').required().asString(),
  awsAccessKeyId: env.get('AWS_ACCESS_KEY_ID').required().asString(),
  awsSecretAccessKey: env.get('AWS_SECRET_ACCESS_KEY').required().asString(),

  lambdaName: env.get('LAMBDA_NAME').required().asString(),
  apiName: env.get('API_NAME').required().asString(),
  corsOrigin: env.get('CORS_ORIGIN_PERMISSION').required().asString(),

  bucketName: env.get('BUCKET_NAME').required().asString(),
  sqsQueueName: env.get('SQS_QUEUE_NAME').required().asString(),
  queueUrl: env.get('EXAMPLE_QUEUE_URL').required().asString(),

  localstackEndpoint: env.get('LOCALSTACK_ENDPOINT').required().asString(),

  checkLocalstack: {
    s3: env.get('CHECK_LOCALSTACK_S3').required().asBool(),
    sqs: env.get('CHECK_LOCALSTACK_SQS').required().asBool(),
    sns: env.get('CHECK_LOCALSTACK_SNS').required().asBool(),
    lambda: env.get('CHECK_LOCALSTACK_LAMBDA').required().asBool(),
    dynamodb: env.get('CHECK_LOCALSTACK_DYNAMODB').required().asBool(),
    kinesis: env.get('CHECK_LOCALSTACK_KINESIS').required().asBool(),
    apigateway: env.get('CHECK_LOCALSTACK_APIGATEWAY').required().asBool(),
    cloudwatch: env.get('CHECK_LOCALSTACK_CLOUDWATCH').required().asBool()
  },

  apiRoutes: parseApiRoutes()
}
