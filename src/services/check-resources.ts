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

  const availableResources = []
  if (checkIsEnabled.s3) availableResources.push('S3')
  if (checkIsEnabled.sqs) availableResources.push('SQS')
  if (checkIsEnabled.lambda) availableResources.push('Lambda')
  if (checkIsEnabled.apigateway) availableResources.push('API Gateway')
  if (checkIsEnabled.dynamodb) availableResources.push('DynamoDB')
  if (checkIsEnabled.cloudwatch) availableResources.push('CloudWatch')
  if (checkIsEnabled.sns) availableResources.push('SNS')
  if (checkIsEnabled.kinesis) availableResources.push('Kinesis')

  const choices = []

  if (availableResources.length > 0) {
    choices.push(...availableResources)
    choices.push(new inquirer.Separator())
  } else {
    console.log(
      '😔 Nenhum recurso do LocalStack está habilitado para verificação.Todos os recursos devem estar desabilitados no seu arquivo .env. Por favor, verifique sua configuração.\n'
    )
  }

  // Adiciona a opção "Sair" sempre, independentemente dos recursos habilitados
  choices.push('Sair')

  while (true) {
    const { resource } = await inquirer.prompt<{ resource: string }>([
      {
        type: 'list',
        name: 'resource',
        message: 'Escolha uma opção:',
        choices
      }
    ])

    if (resource === 'Sair') {
      console.log('👋 Saindo... Até a próxima!')
      process.exit(0)
    }

    // Somente executa a verificação se um recurso foi de fato selecionado (e não era a opção "Sair")
    if (availableResources.includes(resource)) {
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
    } else {
      // Caso um recurso inválido seja selecionado (improvável com `list` type, mas para robustez)
      console.warn(
        '⚠️ Opção inválida. Por favor, escolha uma das opções listadas.\n'
      )
    }
  }
}

async function isLocalStackUp(): Promise<boolean> {
  return await checkLocalStackHealth()
}

async function main() {
  console.log('🚦 Verificando status do LocalStack...\n')

  const available = await isLocalStackUp()

  if (!available) {
    console.error(
      '❌ LocalStack não está em execução. Por favor, inicie o LocalStack e tente novamente.'
    )
    process.exit(1)
  }

  await showMenu()
}

main().catch((err) => {
  console.error('❌ Erro inesperado ao iniciar o verificador:', err)
  process.exit(1)
})
