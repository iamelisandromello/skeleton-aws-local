import inquirer from 'inquirer'
import {
  deleteTablesByFilter,
  deleteQueuesByFilter,
  deleteBucketsByFilter,
  deleteRestApisByFilter,
  deleteLambdaFunctionsByFilter,
  deleteApiGatewayRoutesByFilter
} from './deleters-resources'

async function main() {
  console.log('🧹 Gerenciador de recursos AWS - CLI\n')

  let continuar = true

  while (continuar) {
    const { resourceType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'resourceType',
        message: 'Qual recurso deseja excluir?',
        choices: [
          { name: 'Lambda', value: 'lambda' },
          { name: 'SQS', value: 'sqs' },
          { name: 'S3', value: 's3' },
          { name: 'DynamoDB', value: 'dynamodb' },
          { name: 'API Gateway (REST APIs)', value: 'apigateway' },
          { name: 'API Gateway (Rotas)', value: 'apigateway-route' },
          new inquirer.Separator(),
          { name: 'Sair', value: 'exit' }
        ]
      }
    ])

    if (resourceType === 'exit') {
      console.log('\n👋 Encerrando o gerenciador de recursos.')
      break
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
