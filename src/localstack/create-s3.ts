import {
  s3,
  lambda,
  LAMBDA_NAME,
  BUCKET_NAME
} from '../../localstack/aws-config'
import { ResourcesEnum } from '../main/resources-enum'
import { shouldProvisionOrExit } from '../services/tasks/should-provision'

import {
  CreateBucketCommand,
  PutBucketNotificationConfigurationCommand
} from '@aws-sdk/client-s3'
import { AddPermissionCommand } from '@aws-sdk/client-lambda'

export async function createBucket() {
  shouldProvisionOrExit(ResourcesEnum.LOCALSTACK_S3)

  try {
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }))
    console.log(`✅ Bucket S3 '${BUCKET_NAME}' criado.`)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name: string }).name === 'BucketAlreadyOwnedByYou'
    ) {
      console.log(`ℹ️ Bucket '${BUCKET_NAME}' já existe.`)
    } else {
      console.error('❌ Erro ao criar bucket:', err)
      return
    }
  }

  try {
    await lambda.send(
      new AddPermissionCommand({
        Action: 'lambda:InvokeFunction',
        FunctionName: LAMBDA_NAME,
        Principal: 's3.amazonaws.com',
        StatementId: 's3-permission',
        SourceArn: `arn:aws:s3:::${BUCKET_NAME}`
      })
    )
    console.log('✅ Permissão de invocação adicionada à Lambda para o S3.')
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

  // ⚠️ ARN do Lambda para LocalStack (conta padrão 000000000000)
  const lambdaArn = `arn:aws:lambda:us-east-1:000000000000:function:${LAMBDA_NAME}`

  try {
    await s3.send(
      new PutBucketNotificationConfigurationCommand({
        Bucket: BUCKET_NAME,
        NotificationConfiguration: {
          LambdaFunctionConfigurations: [
            {
              LambdaFunctionArn: lambdaArn,
              Events: ['s3:ObjectCreated:*']
            }
          ]
        }
      })
    )
    console.log('✅ Notificação de evento configurada no S3 para Lambda.')
  } catch (err) {
    console.error('❌ Erro ao configurar evento no S3:', err)
  }
}

// Chama a função para garantir a execução
createBucket()
