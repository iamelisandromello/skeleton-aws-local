import { checkIsEnabled } from '../../localstack/localstack-config'

import {
  deleteTablesByFilter,
  deleteQueuesByFilter,
  deleteBucketsByFilter,
  deleteRestApisByFilter,
  deleteLambdaFunctionsByFilter,
  deleteApiGatewayRoutesByFilter
} from './deleters-resources'

import inquirer from 'inquirer'

async function main() {
  console.log('🧹 Gerenciador de recursos AWS - CLI\n')

  let continuar = true

  while (continuar) {
    // 1. Filtrar os recursos habilitados para exclusão com base em checkIsEnabled
    const availableDeleteResources = []

    if (checkIsEnabled.lambda)
      availableDeleteResources.push({ name: 'Lambda', value: 'lambda' })
    if (checkIsEnabled.sqs)
      availableDeleteResources.push({ name: 'SQS', value: 'sqs' })
    if (checkIsEnabled.s3)
      availableDeleteResources.push({ name: 'S3', value: 's3' })
    if (checkIsEnabled.dynamodb)
      availableDeleteResources.push({ name: 'DynamoDB', value: 'dynamodb' })
    if (checkIsEnabled.apigateway) {
      availableDeleteResources.push({
        name: 'API Gateway (REST APIs)',
        value: 'apigateway'
      })
      availableDeleteResources.push({
        name: 'API Gateway (Rotas)',
        value: 'apigateway-route'
      })
    }

    const choices = []

    if (availableDeleteResources.length > 0) {
      choices.push(...availableDeleteResources)
      choices.push(new inquirer.Separator())
    } else {
      console.log(
        '😔 Nenhum tipo de recurso está habilitado para exclusão no momento. Por favor, verifique sua configuração de recursos no LocalStack.'
      )
    }

    // Adiciona a opção "Sair" sempre, independentemente dos recursos habilitados
    choices.push({ name: 'Sair', value: 'exit' })

    const { resourceType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'resourceType',
        message: 'Qual recurso deseja excluir?',
        choices: choices
      }
    ])

    if (resourceType === 'exit') {
      console.log('\n👋 Encerrando o gerenciador de recursos.')
      break
    }

    // Se não há recursos habilitados e o usuário não escolheu "Sair",
    // isso só deve acontecer se algo estiver errado na lógica ou se ele forçar.
    // Com 'list' type, o usuário só pode escolher das opções dadas, então isso é mais uma salvaguarda.
    const isResourceSelected = availableDeleteResources.some(
      (res) => res.value === resourceType
    )
    if (!isResourceSelected) {
      console.warn(
        '⚠️ Opção de recurso inválida ou não habilitada para exclusão. Por favor, escolha uma das opções listadas.\n'
      )
      continue // Volta para o início do loop
    }

    const { pattern } = await inquirer.prompt([
      {
        type: 'input',
        name: 'pattern',
        message: 'Informe o padrão (regex ou nome exato):',
        default: '.*'
      }
    ])

    const regex = new RegExp(pattern)

    try {
      switch (resourceType) {
        case 'lambda':
          await deleteLambdaFunctionsByFilter(regex)
          break
        case 'sqs':
          await deleteQueuesByFilter(regex)
          break
        case 's3':
          await deleteBucketsByFilter(regex)
          break
        case 'dynamodb':
          await deleteTablesByFilter(regex)
          break
        case 'apigateway':
          await deleteRestApisByFilter(regex)
          break
        case 'apigateway-route': {
          const { apiId } = await inquirer.prompt([
            {
              type: 'input',
              name: 'apiId',
              message:
                'Informe o ID da API Gateway onde estão as rotas a excluir:'
            }
          ])
          await deleteApiGatewayRoutesByFilter(apiId, regex)
          break
        }
        default:
          console.warn(
            '⚠️ Tipo de recurso inválido ou não suportado para exclusão.'
          )
      }

      console.log('\n✅ Recursos excluídos com sucesso.')
    } catch (error) {
      console.error('❌ Erro ao excluir recursos:', error)
    }

    const { repeat } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'repeat',
        message: '\nDeseja excluir outro recurso?',
        default: false
      }
    ])

    continuar = repeat
  }

  console.log('\n🛑 CLI finalizada.\n')
}

main().catch((err) => {
  console.error('❌ Erro inesperado:', err)
  process.exit(1)
})
