// Check Resources Version: v0.1.3
import {
  checkS3,
  checkSQS,
  checkLambda,
  checkAPIGateway,
  checkDynamoDB,
  checkCloudWatch,
  checkSNS,
  checkKinesis
} from './tasks/checkers-task'
import { checkIsEnabled } from '../../localstack/localstack-config'

import inquirer from 'inquirer'

async function checkResources() {
  console.log('🔍 Selecione o recurso do LocalStack para verificar:')

  // Monta as opções do menu com base nos serviços ativados
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
    const answers = await inquirer.prompt<{ resource: string }>([
      {
        type: 'list',
        name: 'resource',
        message: 'Escolha um recurso para verificar:',
        choices
      }
    ])

    if (answers.resource === 'Sair') {
      console.log('👋 Saindo... Até a próxima!')
      process.exit(0)
    }

    console.log(`\n🔍 Verificando recurso: ${answers.resource}\n`)

    switch (answers.resource) {
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
        console.log('Recurso inválido')
        break
    }

    console.log('✅ Verificação concluída.\n')
  }
}

checkResources().catch((err) => {
  console.error('❌ Erro inesperado durante a verificação de recursos:', err)
  process.exit(1)
})
