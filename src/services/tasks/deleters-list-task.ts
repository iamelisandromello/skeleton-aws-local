import {
  lambda,
  sqs,
  s3,
  dynamodb,
  apigateway
} from '../../../localstack/aws-config'
import { extractNameFromUrl } from './deleters-selectors-task'

import {
  ListBucketsCommand,
  DeleteBucketCommand,
  type Bucket
} from '@aws-sdk/client-s3'
import {
  ListFunctionsCommand,
  DeleteFunctionCommand,
  type FunctionConfiguration
} from '@aws-sdk/client-lambda'
import {
  GetRestApisCommand,
  DeleteRestApiCommand,
  DeleteResourceCommand,
  GetResourcesCommand,
  type Resource,
  type RestApi
} from '@aws-sdk/client-api-gateway'
import { ListQueuesCommand, DeleteQueueCommand } from '@aws-sdk/client-sqs'
import { ListTablesCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb'

// ===============================================
// FUNÇÕES DE LISTAGEM DE RECURSOS
// ===============================================

export async function listLambdaFunctions(): Promise<FunctionConfiguration[]> {
  const { Functions } = await lambda.send(new ListFunctionsCommand({}))
  return Functions ?? []
}

export async function listSqsQueues(): Promise<string[]> {
  const { QueueUrls } = await sqs.send(new ListQueuesCommand({}))
  return QueueUrls ?? []
}

export async function listS3Buckets(): Promise<Bucket[]> {
  const { Buckets } = await s3.send(new ListBucketsCommand({}))
  return Buckets ?? []
}

export async function listDynamoDbTables(): Promise<string[]> {
  const { TableNames } = await dynamodb.send(new ListTablesCommand({}))
  return TableNames ?? []
}

export async function listApiGatewayRestApis(): Promise<RestApi[]> {
  const { items } = await apigateway.send(new GetRestApisCommand({}))
  return items ?? []
}

export async function listApiGatewayResources(
  apiId: string
): Promise<Resource[]> {
  const res = await apigateway.send(
    new GetResourcesCommand({ restApiId: apiId })
  )
  return res.items ?? []
}

// ===============================================
// FUNÇÕES DE EXCLUSÃO DE RECURSOS SELECIONADOS
// ===============================================

// Lambda
export async function deleteSelectedLambdaFunctions(functionNames: string[]) {
  for (const functionName of functionNames) {
    await lambda.send(new DeleteFunctionCommand({ FunctionName: functionName }))
    console.log(`🧨 Lambda excluída: ${functionName}`)
  }
}

// SQS
export async function deleteSelectedSqsQueues(queueUrls: string[]) {
  for (const url of queueUrls) {
    await sqs.send(new DeleteQueueCommand({ QueueUrl: url }))
    console.log(`📭 Fila SQS excluída: ${extractNameFromUrl(url)}`)
  }
}

// S3
export async function deleteSelectedS3Buckets(bucketNames: string[]) {
  for (const bucketName of bucketNames) {
    await s3.send(new DeleteBucketCommand({ Bucket: bucketName }))
    console.log(`🪣 Bucket S3 excluído: ${bucketName}`)
  }
}

// DynamoDB
export async function deleteSelectedDynamoDbTables(tableNames: string[]) {
  for (const tableName of tableNames) {
    await dynamodb.send(new DeleteTableCommand({ TableName: tableName }))
    console.log(`📦 Tabela DynamoDB excluída: ${tableName}`)
  }
}

// API Gateway REST APIs
export async function deleteSelectedRestApis(apiIds: string[]) {
  for (const apiId of apiIds) {
    // Para obter o nome para o log, talvez seja preciso uma chamada extra se você não tiver ele no id
    // Ou passar um objeto {id, name} para esta função. Por simplicidade, assumindo que apiId é suficiente.
    await apigateway.send(new DeleteRestApiCommand({ restApiId: apiId }))
    console.log(`🌐 API Gateway excluída: ID ${apiId}`)
  }
}

// Routes do API Gateway
export async function deleteSelectedApiGatewayRoutes(
  apiId: string,
  resourceIds: string[],
  paths: string[]
) {
  for (let i = 0; i < resourceIds.length; i++) {
    const resourceId = resourceIds[i]
    const path = paths[i]
    console.log(`🗑️  Deletando rota ${path} (id=${resourceId})...`)
    await apigateway.send(
      new DeleteResourceCommand({
        restApiId: apiId,
        resourceId
      })
    )
  }
}
