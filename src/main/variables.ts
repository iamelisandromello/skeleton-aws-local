import env from 'env-var'

const rawRoutes = env.get('API_ROUTES').required().asJsonArray()

if (!Array.isArray(rawRoutes)) {
  throw new Error('API_ROUTES deve ser um array JSON.')
}

for (const route of rawRoutes) {
  if (typeof route.path !== 'string' || typeof route.method !== 'string') {
    throw new Error(
      'Cada rota em API_ROUTES deve ter "path" e "method" como string.'
    )
  }
}
const apiRoutes = rawRoutes as Array<{ path: string; method: string }>

export const variables = {
  apiRoutes,
  tz: env.get('TZ').required().asString(),
  apiName: env.get('API_NAME').required().asString(),
  awsRegion: env.get('AWS_REGION').required().asString(),
  lambdaName: env.get('LAMBDA_NAME').required().asString(),
  bucketName: env.get('BUCKET_NAME').required().asString(),
  queue: env.get('EXAMPLE_QUEUE_URL').required().asString(),
  sqsQueueName: env.get('SQS_QUEUE_NAME').required().asString(),
  awsAccessKeyId: env.get('AWS_ACCESS_KEY_ID').required().asString(),
  checkLocalStackS3: env.get('CHECK_LOCALSTACK_S3').required().asBool(),
  checkLocalStackSqs: env.get('CHECK_LOCALSTACK_SQS').required().asBool(),
  checkLocalStackSns: env.get('CHECK_LOCALSTACK_SNS').required().asBool(),
  localstackEndpoint: env.get('LOCALSTACK_ENDPOINT').required().asString(),
  awsSecretAccessKey: env.get('AWS_SECRET_ACCESS_KEY').required().asString(),
  checkLocalStackLambda: env.get('CHECK_LOCALSTACK_LAMBDA').required().asBool(),
  checkLocalStackApiGateway: env
    .get('CHECK_LOCALSTACK_APIGATEWAY')
    .required()
    .asBool(),
  checkLocalStackDynamoDb: env
    .get('CHECK_LOCALSTACK_DYNAMODB')
    .required()
    .asBool(),
  checkLocalStackCloudWatch: env
    .get('CHECK_LOCALSTACK_CLOUDWATCH')
    .required()
    .asBool(),
  checkLocalStackKinesis: env
    .get('CHECK_LOCALSTACK_KINESIS')
    .required()
    .asBool()
}
