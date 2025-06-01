import { variables } from '../src/main/variables'

import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'
import { LambdaClient } from '@aws-sdk/client-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { APIGatewayClient } from '@aws-sdk/client-api-gateway'

type Routes = {
  path: string
  method: string
}[]

type Route = {
  path: string
  method: string
}

// Credenciais locais para LocalStack (ajuste para produção)
const credentials = {
  accessKeyId: variables.awsAccessKeyId,
  secretAccessKey: variables.awsSecretAccessKey
}

export const localConfig = {
  region: variables.awsRegion,
  endpoint: variables.localstackEndpoint,
  credentials
}

export const region = variables.awsRegion
export const API_NAME = variables.apiName
const rawRoutes: Routes = variables.apiRoutes
export const LAMBDA_NAME = variables.lambdaName
export const BUCKET_NAME = variables.bucketName
export const endpoint = variables.localstackEndpoint
export const SQS_QUEUE_NAME = variables.sqsQueueName

console.log('AWS_REGION:', variables.awsRegion)
console.log('REGION:', variables.awsRegion)
console.log('Const region:', region)

// Exporta os clients AWS SDK v3 configurados para LocalStack
export const s3 = new S3Client({
  region,
  endpoint,
  credentials,
  forcePathStyle: true
})
export const sqs = new SQSClient(localConfig)
export const lambda = new LambdaClient(localConfig)
export const dynamodb = new DynamoDBClient(localConfig)
export const apigateway = new APIGatewayClient(localConfig)

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

export const API_ROUTES: Route[] = rawRoutes as Route[]
