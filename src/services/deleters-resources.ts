// deleters-resources.ts
import { extractNameFromUrl } from './tasks/deleters-selectors-task'
import {
  lambda,
  sqs,
  s3,
  dynamodb,
  apigateway
} from '../../localstack/aws-config'

import {
  ListFunctionsCommand,
  DeleteFunctionCommand
} from '@aws-sdk/client-lambda'
import { ListQueuesCommand, DeleteQueueCommand } from '@aws-sdk/client-sqs'
import { ListBucketsCommand, DeleteBucketCommand } from '@aws-sdk/client-s3'
import { ListTablesCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb'
import {
  GetRestApisCommand,
  DeleteRestApiCommand,
  DeleteResourceCommand,
  GetResourcesCommand
} from '@aws-sdk/client-api-gateway'

// Lambda
export async function deleteLambdaFunctionsByFilter(pattern: RegExp) {
  const { Functions } = await lambda.send(new ListFunctionsCommand({}))
  const matches = (Functions ?? []).filter((fn) =>
    pattern.test(fn.FunctionName ?? '')
  )

  for (const fn of matches) {
    const functionName = fn.FunctionName
    if (!functionName) continue

    await lambda.send(new DeleteFunctionCommand({ FunctionName: functionName }))
    console.log(`🧨 Lambda excluída: ${functionName}`)
  }
}

// SQS
export async function deleteQueuesByFilter(pattern: RegExp) {
  const { QueueUrls } = await sqs.send(new ListQueuesCommand({}))
  const urls = QueueUrls ?? []
  const filtered = urls.filter((url) => pattern.test(extractNameFromUrl(url)))

  for (const url of filtered) {
    await sqs.send(new DeleteQueueCommand({ QueueUrl: url }))
    console.log(`📭 Fila SQS excluída: ${extractNameFromUrl(url)}`)
  }
}

// S3
export async function deleteBucketsByFilter(pattern: RegExp) {
  const { Buckets } = await s3.send(new ListBucketsCommand({}))
  const filtered = (Buckets ?? []).filter((bucket) =>
    pattern.test(bucket.Name ?? '')
  )

  for (const bucket of filtered) {
    const bucketName = bucket.Name
    if (!bucketName) continue

    await s3.send(new DeleteBucketCommand({ Bucket: bucketName }))
    console.log(`🪣 Bucket S3 excluído: ${bucketName}`)
  }
}

// DynamoDB
export async function deleteTablesByFilter(pattern: RegExp) {
  const { TableNames } = await dynamodb.send(new ListTablesCommand({}))
  const filtered = (TableNames ?? []).filter((name) => pattern.test(name))

  for (const tableName of filtered) {
    await dynamodb.send(new DeleteTableCommand({ TableName: tableName }))
    console.log(`📦 Tabela DynamoDB excluída: ${tableName}`)
  }
}

// API Gateway
export async function deleteRestApisByFilter(pattern: RegExp) {
  const { items } = await apigateway.send(new GetRestApisCommand({}))
  const filtered = (items ?? []).filter((api) => pattern.test(api.name ?? ''))

  for (const api of filtered) {
    const restApiId = api.id
    if (!restApiId) continue

    await apigateway.send(new DeleteRestApiCommand({ restApiId }))
    console.log(`🌐 API Gateway excluída: ${api.name} (${restApiId})`)
  }
}

// Routes do API Gateway
export async function deleteApiGatewayRoutesByFilter(
  apiId: string,
  pattern: RegExp
) {
  const res = await apigateway.send(
    new GetResourcesCommand({ restApiId: apiId })
  )
  const resources = res.items ?? []

  const matching = resources.filter((r) => {
    const path = r.path || ''
    return pattern.test(path)
  })

  for (const resource of matching) {
    const resourceId = resource.id
    if (!resourceId) continue

    console.log(`🗑️  Deletando rota ${resource.path} (id=${resourceId})...`)
    await apigateway.send(
      new DeleteResourceCommand({
        restApiId: apiId,
        resourceId
      })
    )
  }

  if (matching.length === 0) {
    console.log('⚠️  Nenhuma rota encontrada para o padrão informado.')
  }
}
