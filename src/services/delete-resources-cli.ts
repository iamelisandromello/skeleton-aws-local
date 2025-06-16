import inquirer from 'inquirer'
import { checkIsEnabled } from '../../localstack/localstack-config'

import {
  listLambdaFunctions,
  deleteSelectedLambdaFunctions,
  listSqsQueues,
  deleteSelectedSqsQueues,
  listS3Buckets,
  deleteSelectedS3Buckets,
  listDynamoDbTables,
  deleteSelectedDynamoDbTables,
  listApiGatewayRestApis,
  deleteSelectedRestApis,
  listApiGatewayResources,
  deleteSelectedApiGatewayRoutes
} from './tasks/deleters-list-task'

import { extractNameFromUrl } from './tasks/deleters-selectors-task'

async function main() {
  console.log('🧹 Gerenciador de recursos AWS - CLI\n')

  while (true) {
    const availableDeleteResources = []

    if (checkIsEnabled.lambda)
      availableDeleteResources.push({
        name: 'Lambda Functions',
        value: 'lambda'
      })
    if (checkIsEnabled.sqs)
      availableDeleteResources.push({ name: 'SQS Queues', value: 'sqs' })
    if (checkIsEnabled.s3)
      availableDeleteResources.push({ name: 'S3 Buckets', value: 's3' })
    if (checkIsEnabled.dynamodb)
      availableDeleteResources.push({
        name: 'DynamoDB Tables',
        value: 'dynamodb'
      })
    if (checkIsEnabled.apigateway) {
      availableDeleteResources.push({
        name: 'API Gateway (REST APIs)',
        value: 'apigateway'
      })
      availableDeleteResources.push({
        name: 'API Gateway (Routes)',
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

    choices.push({ name: 'Sair do Gerenciador', value: 'exit' })

    const { resourceType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'resourceType',
        message: 'Qual tipo de recurso você deseja gerenciar/excluir?',
        choices: choices
      }
    ])

    if (resourceType === 'exit') {
      console.log('\n👋 Encerrando o gerenciador de recursos. Até a próxima!')
      break
    }

    // Se a lista de recursos estava vazia e o usuário não escolheu "Sair" (improvável com tipo 'list')
    if (availableDeleteResources.length === 0) {
      console.warn(
        '⚠️ Nenhuma opção de recurso para exclusão disponível. Por favor, inicie novamente.'
      )
      continue
    }

    console.log(`\n🔍 Listando recursos do tipo: ${resourceType}\n`)

    try {
      let selectedItems: string[] | undefined
      let apiIdForRoutes: string | undefined

      switch (resourceType) {
        case 'lambda': {
          const lambdaFunctions = await listLambdaFunctions()
          if (lambdaFunctions.length === 0) {
            console.log('✨ Nenhuma função Lambda encontrada.')
            break
          }
          const { selectedLambdas } = await inquirer.prompt<{
            selectedLambdas: string[]
          }>([
            {
              type: 'checkbox',
              name: 'selectedLambdas',
              message: 'Selecione as funções Lambda para excluir:',
              choices: lambdaFunctions.map((fn) => ({
                name: fn.FunctionName ?? 'Nome Desconhecido',
                value: fn.FunctionName ?? ''
              }))
            }
          ])
          selectedItems = selectedLambdas.filter(Boolean)
          break
        }

        case 'sqs': {
          const sqsQueues = await listSqsQueues()
          if (sqsQueues.length === 0) {
            console.log('✨ Nenhuma fila SQS encontrada.')
            break
          }
          const { selectedSqs } = await inquirer.prompt<{
            selectedSqs: string[]
          }>([
            {
              type: 'checkbox',
              name: 'selectedSqs',
              message: 'Selecione as filas SQS para excluir:',
              choices: sqsQueues.map((url) => ({
                name: extractNameFromUrl(url),
                value: url
              }))
            }
          ])
          selectedItems = selectedSqs.filter(Boolean)
          break
        }

        case 's3': {
          const s3Buckets = await listS3Buckets()
          if (s3Buckets.length === 0) {
            console.log('✨ Nenhum bucket S3 encontrado.')
            break
          }
          const { selectedS3 } = await inquirer.prompt<{
            selectedS3: string[]
          }>([
            {
              type: 'checkbox',
              name: 'selectedS3',
              message: 'Selecione os buckets S3 para excluir:',
              choices: s3Buckets.map((bucket) => ({
                name: bucket.Name ?? 'Nome Desconhecido',
                value: bucket.Name ?? ''
              }))
            }
          ])
          selectedItems = selectedS3.filter(Boolean)
          break
        }

        case 'dynamodb': {
          const dynamoTables = await listDynamoDbTables()
          if (dynamoTables.length === 0) {
            console.log('✨ Nenhuma tabela DynamoDB encontrada.')
            break
          }
          const { selectedDynamo } = await inquirer.prompt<{
            selectedDynamo: string[]
          }>([
            {
              type: 'checkbox',
              name: 'selectedDynamo',
              message: 'Selecione as tabelas DynamoDB para excluir:',
              choices: dynamoTables.map((name) => ({ name: name, value: name }))
            }
          ])
          selectedItems = selectedDynamo.filter(Boolean)
          break
        }

        case 'apigateway': {
          const restApis = await listApiGatewayRestApis()
          if (restApis.length === 0) {
            console.log('✨ Nenhuma API Gateway (REST API) encontrada.')
            break
          }
          const { selectedApis } = await inquirer.prompt<{
            selectedApis: string[]
          }>([
            {
              type: 'checkbox',
              name: 'selectedApis',
              message: 'Selecione as API Gateways (REST APIs) para excluir:',
              choices: restApis.map((api) => ({
                name: `${api.name} (${api.id})`,
                value: api.id
              }))
            }
          ])
          selectedItems = selectedApis.filter(Boolean)
          break
        }

        case 'apigateway-route': {
          const allRestApis = await listApiGatewayRestApis()
          if (allRestApis.length === 0) {
            console.log(
              '✨ Nenhuma API Gateway (REST API) encontrada para buscar rotas.'
            )
            break
          }

          const { chosenApiId: chosenApiIdLocal } = await inquirer.prompt<{
            chosenApiId: string
          }>([
            {
              type: 'list',
              name: 'chosenApiId',
              message: 'Selecione a API Gateway cujas rotas deseja gerenciar:',
              choices: allRestApis.map((api) => ({
                name: `${api.name} (${api.id})`,
                value: api.id
              }))
            }
          ])

          apiIdForRoutes = chosenApiIdLocal
          const apiResources = await listApiGatewayResources(apiIdForRoutes)

          if (apiResources.length === 0) {
            console.log(
              `✨ Nenhuma rota encontrada para a API Gateway: ${apiIdForRoutes}.`
            )
            break
          }

          const routeChoices = apiResources.map((res) => ({
            name: `${res.path ?? 'Caminho Desconhecido'} (ID: ${res.id})`,
            value: res.id
          }))

          const { selectedRoutes } = await inquirer.prompt<{
            selectedRoutes: string[]
          }>([
            {
              type: 'checkbox',
              name: 'selectedRoutes',
              message: 'Selecione as rotas para excluir:',
              choices: routeChoices
            }
          ])

          const selectedRouteObjects = apiResources.filter((res) =>
            selectedRoutes.includes(res.id ?? '')
          )
          selectedItems = selectedRouteObjects
            .map((res) => res.id ?? '')
            .filter(Boolean)
          const selectedRoutePaths = selectedRouteObjects
            .map((res) => res.path ?? '')
            .filter(Boolean)

          if (selectedItems.length > 0 && apiIdForRoutes) {
            console.log(
              `\n🗑️ Excluindo rotas selecionadas na API: ${apiIdForRoutes}...`
            )
            await deleteSelectedApiGatewayRoutes(
              apiIdForRoutes,
              selectedItems,
              selectedRoutePaths
            )
            console.log('✅ Rotas excluídas com sucesso.')
          } else if (selectedItems.length === 0) {
            console.log('🤷 Nenhuma rota selecionada para exclusão.')
          }
          break
        }
      }

      // Lógica de exclusão para os tipos que usam 'selectedItems' diretamente
      // Esta lógica é executada APÓS o switch para os casos que atribuem a 'selectedItems'
      // O case 'apigateway-route' já realiza a exclusão dentro do seu próprio bloco
      if (
        selectedItems &&
        selectedItems.length > 0 &&
        resourceType !== 'apigateway-route'
      ) {
        console.log('\n🗑️ Excluindo recursos selecionados...')
        switch (resourceType) {
          case 'lambda':
            await deleteSelectedLambdaFunctions(selectedItems)
            break
          case 'sqs':
            await deleteSelectedSqsQueues(selectedItems)
            break
          case 's3':
            await deleteSelectedS3Buckets(selectedItems)
            break
          case 'dynamodb':
            await deleteSelectedDynamoDbTables(selectedItems)
            break
          case 'apigateway':
            await deleteSelectedRestApis(selectedItems)
            break
        }
        console.log('✅ Recursos excluídos com sucesso.')
      } else if (
        selectedItems &&
        selectedItems.length === 0 &&
        resourceType !== 'apigateway-route'
      ) {
        console.log('🤷 Nenhum recurso selecionado para exclusão.')
      }
    } catch (error) {
      console.error('❌ Erro ao listar ou excluir recursos:', error)
    }

    const { repeat } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'repeat',
        message: '\nDeseja gerenciar/excluir outro recurso?',
        default: false
      }
    ])

    if (!repeat) {
      console.log('\n🛑 CLI finalizada.\n')
      break
    }
  }
}

main().catch((err) => {
  console.error('❌ Erro inesperado:', err)
  process.exit(1)
})
