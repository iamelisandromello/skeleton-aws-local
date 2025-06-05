// Check Resources Version: v0.2.0
import {
  checkS3,
  checkSQS,
  checkLambda,
  checkAPIGateway,
  checkDynamoDB,
  checkCloudWatch,
  checkSNS,
  checkKinesis,
  checkLocalStackHealth
} from './tasks/checkers-task'
import { checkIsEnabled } from '../../localstack/localstack-config'

import inquirer from 'inquirer'

async function showMenu() {
  console.log('🔍 Selecione o recurso do LocalStack para verificar:\n')

  const choices = []
  if (checkIsEnabled.s3) choices.push('S3')
  if (checkIsEnabled.sqs) choices.push('SQS')
  if (checkIsEnabled.lambda) choices.push('Lambda')
  if (checkIsEnabled.apigateway) choices.push('API Gateway')
  if (checkIsEnabled.dynamodb) choices.push('DynamoDB')
  if (checkIsEnabled.cloudwatch) choices.push('CloudWatch')
  if (checkIsEnabled.sns) choices.push('SNS')
  if (checkIsEnabled.kinesis) choices.push('Kinesis')

  choices.push(new inquirer.Separator())
  choices.push('Sair')

  while (true) {
    const { resource } = await inquirer.prompt<{ resource: string }>([
      {
        type: 'list',
        name: 'resource',
        message: 'Escolha um recurso para verificar:',
        choices
      }
    ])

    if (resource === 'Sair') {
      console.log('👋 Saindo... Até a próxima!')
      process.exit(0)
    }

    console.log(`\n🔍 Verificando recurso: ${resource}\n`)

    try {
      switch (resource) {
        case 'S3':
          await checkS3()
          break
        case 'SQS':
          await checkSQS()
          break
        case 'Lambda':
          await checkLambda()
          break
        case 'API Gateway':
          await checkAPIGateway()
          break
        case 'DynamoDB':
          await checkDynamoDB()
          break
        case 'CloudWatch':
          await checkCloudWatch()
          break
        case 'SNS':
          await checkSNS()
          break
        case 'Kinesis':
          await checkKinesis()
          break
        default:
          console.warn('⚠️ Recurso inválido.')
      }
    } catch (err) {
      console.error('❌ Erro ao verificar o recurso:', err)
    }

    console.log('✅ Verificação concluída.\n')
  }
}

async function isLocalStackUp(): Promise<boolean> {
  return await checkLocalStackHealth()
}

async function main() {
  console.log('🚦 Verificando status do LocalStack...\n')

  const available = await isLocalStackUp()

  if (!available) {
    process.exit(1)
  }

  await showMenu()
}

main().catch((err) => {
  console.error('❌ Erro inesperado ao iniciar o verificador:', err)
  process.exit(1)
})
