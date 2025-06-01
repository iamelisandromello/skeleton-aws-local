// src/localstack/create-api-gateway.ts
import {
  CreateRestApiCommand,
  GetRestApisCommand,
  CreateResourceCommand,
  GetResourcesCommand,
  PutMethodCommand,
  PutIntegrationCommand
} from '@aws-sdk/client-api-gateway'
import {
  apigateway,
  API_NAME,
  API_ROUTES,
  LAMBDA_NAME
} from '../../localstack/aws-config'

async function main() {
  console.log(`🚀 Verificando se a API "${API_NAME}" já existe...`)

  const apis = await apigateway.send(new GetRestApisCommand({ limit: 500 }))
  const existingApi = apis.items?.find((api) => api.name === API_NAME)

  let restApiId: string

  if (existingApi?.id) {
    console.log(`✅ API "${API_NAME}" já existe.`)
    restApiId = existingApi.id
  } else {
    console.log(`🛠️ Criando API Gateway "${API_NAME}"...`)
    const createApiRes = await apigateway.send(
      new CreateRestApiCommand({
        name: API_NAME,
        description: 'API gerenciada localmente via script'
      })
    )

    if (!createApiRes.id) {
      throw new Error('❌ Falha ao criar a API Gateway: ID não retornado.')
    }

    restApiId = createApiRes.id
    console.log(`✅ API "${API_NAME}" criada com ID: ${restApiId}`)
  }

  // Busca recursos (rotas)
  const resources = await apigateway.send(
    new GetResourcesCommand({ restApiId })
  )

  const rootResource = resources.items?.find((res) => res.path === '/')
  if (!rootResource?.id) {
    throw new Error('❌ Recurso raiz não encontrado!')
  }

  for (const route of API_ROUTES) {
    const existingRoute = resources.items?.find(
      (res) => res.path === route.path
    )

    if (existingRoute) {
      console.log(`⚠️ Rota "${route.path}" já existe. Ignorando.`)
      continue
    }

    console.log(`🛠️ Criando rota "${route.path}"...`)

    // Cria o recurso
    const createResource = await apigateway.send(
      new CreateResourceCommand({
        parentId: rootResource.id,
        pathPart: route.path.replace(/^\//, ''), // remove leading slash
        restApiId
      })
    )

    if (!createResource.id) {
      throw new Error(
        `❌ ID do recurso para rota "${route.path}" não encontrado.`
      )
    }

    // Adiciona método GET
    await apigateway.send(
      new PutMethodCommand({
        restApiId,
        resourceId: createResource.id,
        httpMethod: route.method,
        authorizationType: 'NONE'
      })
    )

    // Integrar com Lambda (simulado)
    await apigateway.send(
      new PutIntegrationCommand({
        restApiId,
        resourceId: createResource.id,
        httpMethod: route.method,
        type: 'AWS_PROXY',
        integrationHttpMethod: 'POST',
        uri: `arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:000000000000:function:${LAMBDA_NAME}/invocations`
      })
    )

    console.log(
      `✅ Rota "${route.path}" criada e integrada com Lambda "${LAMBDA_NAME}".`
    )
  }
}

main().catch((err) => {
  console.error('❌ Erro ao criar API Gateway:', err)
})
