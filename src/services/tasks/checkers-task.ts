// cli/services/tasks/checkers-task.ts
import { logError, logResult, showLocalStackDocsLink } from '../../logers/logs'
import { localConfig } from '../../../localstack/aws-config'

import http from 'node:http'

import {
  DynamoDBClient,
  ListTablesCommand,
  DescribeTableCommand
} from '@aws-sdk/client-dynamodb'
import {
  APIGatewayClient,
  GetRestApisCommand,
  GetResourcesCommand
} from '@aws-sdk/client-api-gateway'
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand
} from '@aws-sdk/client-cloudwatch-logs'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import { SQSClient, ListQueuesCommand } from '@aws-sdk/client-sqs'
import { SNSClient, ListTopicsCommand } from '@aws-sdk/client-sns'
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda'
import { KinesisClient, ListStreamsCommand } from '@aws-sdk/client-kinesis'

export async function checkS3() {
  try {
    const client = new S3Client(localConfig)
    const result = await client.send(new ListBucketsCommand({}))
    logResult(
      '🪣 Buckets S3:',
      result.Buckets?.map((b) => b.Name)
    )
  } catch (err) {
    logError('S3', err)
  }
}

export async function checkSQS() {
  try {
    const client = new SQSClient(localConfig)
    const result = await client.send(new ListQueuesCommand({}))
    logResult('📬 Filas SQS:', result.QueueUrls)
  } catch (err) {
    logError('SQS', err)
  }
}

export async function checkLambda() {
  try {
    const client = new LambdaClient(localConfig)
    const result = await client.send(new ListFunctionsCommand({}))
    logResult(
      '⚙️ Lambdas:',
      result.Functions?.map((fn) => fn.FunctionName)
    )
  } catch (err) {
    logError('Lambda', err)
  }
}

export async function checkAPIGateway() {
  try {
    const client = new APIGatewayClient(localConfig)
    const result = await client.send(new GetRestApisCommand({}))
    const apis = result.items || []

    logResult('🌐 APIs Gateway', apis, (api) => ({
      id: api.id,
      name: api.name
    }))

    for (const api of apis) {
      if (!api.id) {
        console.warn(`⚠️  API "${api.name}" não possui ID. Ignorando...`)
        continue
      }

      const resources = await client.send(
        new GetResourcesCommand({ restApiId: api.id })
      )
      logResult(`  📍 Rotas da API ${api.name}`, resources.items, (r) => r.path)
    }
  } catch (err) {
    logError('API Gateway', err)
  }
}

export async function checkDynamoDB() {
  try {
    const client = new DynamoDBClient(localConfig)
    const result = await client.send(new ListTablesCommand({}))
    const tableNames = result.TableNames || []
    logResult('🗄️ Tabelas DynamoDB:', tableNames)
    for (const name of tableNames) {
      const desc = await client.send(
        new DescribeTableCommand({ TableName: name })
      )
      logResult(`  📄 Estrutura de ${name}:`, desc.Table?.KeySchema)
    }
  } catch (err) {
    logError('DynamoDB', err)
  }
}

export async function checkCloudWatch() {
  try {
    const client = new CloudWatchLogsClient(localConfig)
    const result = await client.send(new DescribeLogGroupsCommand({}))
    logResult(
      '📘 Log Groups:',
      result.logGroups?.map((g) => g.logGroupName)
    )
  } catch (err) {
    logError('CloudWatch Logs', err)
  }
}

export async function checkSNS() {
  try {
    const client = new SNSClient(localConfig)
    const result = await client.send(new ListTopicsCommand({}))
    logResult(
      '📣 Tópicos SNS:',
      result.Topics?.map((t) => t.TopicArn)
    )
  } catch (err) {
    logError('SNS', err)
  }
}

export async function checkKinesis() {
  try {
    const client = new KinesisClient(localConfig)
    const result = await client.send(new ListStreamsCommand({}))
    logResult('🔀 Streams Kinesis:', result.StreamNames)
  } catch (err) {
    logError('Kinesis', err)
  }
}

export async function checkLocalStackHealth(): Promise<boolean> {
  console.log('📡 Verificando saúde do LocalStack...')

  return new Promise((resolve) => {
    const req = http.get('http://localhost:4566/_localstack/health', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ LocalStack está rodando normalmente!\n')
        resolve(true)
      } else {
        console.error(`❌ LocalStack respondeu com status ${res.statusCode}.`)
        console.info('💡 Verifique se o container está saudável.')
        showLocalStackDocsLink()
        resolve(false)
      }
    })

    req.on('error', () => {
      console.error('🛑 Não foi possível conectar ao LocalStack.')
      console.info(
        '💡 Certifique-se de que o container está rodando (porta 4566).'
      )
      showLocalStackDocsLink()
      resolve(false)
    })

    req.setTimeout(10000, () => {
      console.error('⏱️ Timeout: LocalStack não respondeu a tempo.')
      showLocalStackDocsLink()
      resolve(false)
    })
  })
}
