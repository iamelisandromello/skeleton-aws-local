// scripts/localstack/create-sqs.ts
import {
  CreateQueueCommand,
  GetQueueAttributesCommand,
  ListQueuesCommand
} from '@aws-sdk/client-sqs'
import {
  AddPermissionCommand,
  CreateEventSourceMappingCommand
} from '@aws-sdk/client-lambda'

import {
  SQS_QUEUE_NAME,
  LAMBDA_NAME,
  lambda,
  sqs
} from '../../localstack/aws-config'

export async function createQueue() {
  const queueName = SQS_QUEUE_NAME
  const lambdaName = LAMBDA_NAME

  let queueUrl: string | undefined
  let queueArn: string | undefined

  console.log(`🔍 Verificando se a fila "${queueName}" já existe...`)

  try {
    const listResp = await sqs.send(new ListQueuesCommand({}))

    queueUrl = listResp.QueueUrls?.find((url) => url.endsWith(`/${queueName}`))

    if (queueUrl) {
      console.log(`ℹ️ Fila '${queueName}' já existe.`)
    } else {
      console.log(`🛠️ Criando fila '${queueName}'...`)
      const createResp = await sqs.send(
        new CreateQueueCommand({ QueueName: queueName })
      )

      console.log(
        '🔧 CreateQueueCommand response:',
        JSON.stringify(createResp, null, 2)
      )
      queueUrl = createResp.QueueUrl

      if (queueUrl) {
        console.log(`✅ Fila '${queueName}' criada com URL: ${queueUrl}`)
      } else {
        console.error('❌ Nenhuma URL retornada na criação da fila.')
      }
    }

    if (!queueUrl) {
      console.error('❌ QueueUrl não disponível.')
      return
    }
  } catch (err) {
    console.error('❌ Erro ao verificar/criar a fila SQS:', err)
    return
  }

  try {
    const attrResp = await sqs.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ['QueueArn']
      })
    )

    if (!attrResp.Attributes?.QueueArn) {
      console.error('❌ ARN da fila não encontrado.')
      return
    }

    queueArn = attrResp.Attributes.QueueArn
  } catch (err) {
    console.error('❌ Erro ao obter ARN da fila:', err)
    return
  }

  try {
    await lambda.send(
      new AddPermissionCommand({
        Action: 'lambda:InvokeFunction',
        FunctionName: lambdaName,
        Principal: 'sqs.amazonaws.com',
        StatementId: 'sqs-permission',
        SourceArn: queueArn
      })
    )
    console.log('✅ Permissão de invocação adicionada à Lambda.')
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name: string }).name === 'ResourceConflictException'
    ) {
      console.log('ℹ️ Permissão já existente.')
    } else {
      console.error('❌ Erro ao adicionar permissão à Lambda:', err)
    }
  }

  try {
    await lambda.send(
      new CreateEventSourceMappingCommand({
        EventSourceArn: queueArn,
        FunctionName: lambdaName,
        BatchSize: 1,
        Enabled: true
      })
    )
    console.log('✅ EventSourceMapping criado entre SQS e Lambda.')
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name: string }).name === 'ResourceConflictException'
    ) {
      console.log('ℹ️ EventSourceMapping já existente.')
    } else {
      console.error('❌ Erro ao criar EventSourceMapping:', err)
    }
  }
}

createQueue()
