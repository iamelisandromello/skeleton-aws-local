import { dynamodb } from '../../localstack/aws-config'
import { ResourcesEnum } from '../main/resources-enum'
import { variables } from '../main/variables'
import { shouldProvisionOrExit } from '../services/tasks/should-provision'

import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import {
  CreateTableCommand,
  PutItemCommand,
  type CreateTableCommandInput
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb' // 🔄 Converte JS → formato do DynamoDB usando o utilitário oficial
import { ScanCommand } from '@aws-sdk/client-dynamodb' // 🔄 Importa o comando Scan para contar itens nas tabelas

async function createDynamoDBTables() {
  shouldProvisionOrExit(ResourcesEnum.LOCALSTACK_DYNAMODB)

  const rawTableConfigs = variables.dynamoDbTables
  const rawSeedData = variables.dynamoDbSeeds
  const seedFilePath = variables.dynamoDbSeedFile

  if (!rawTableConfigs) {
    throw new Error('⚠️ Variável de ambiente DYNAMODB_TABLES não definida.')
  }

  let tableConfigs: CreateTableCommandInput[]
  try {
    tableConfigs = JSON.parse(rawTableConfigs)
  } catch (error) {
    throw new Error(`❌ Erro ao fazer parse de DYNAMODB_TABLES: ${error}`)
  }

  // Carrega os seeds
  let seeds: Record<string, any[]> = {}

  if (rawSeedData) {
    try {
      seeds = JSON.parse(rawSeedData)
      console.log('📦 Seeds carregados via DYNAMODB_SEEDS.')
    } catch (error) {
      throw new Error(`❌ Erro ao fazer parse de DYNAMODB_SEEDS: ${error}`)
    }
  } else if (seedFilePath) {
    //const resolvedPath = path.resolve(process.cwd(), seedFilePath)

    const rootDir = process.cwd()
    const resolvedPath = path.resolve(rootDir, seedFilePath)
    const relativePath = path.relative(rootDir, resolvedPath)

    if (existsSync(resolvedPath)) {
      try {
        seeds = JSON.parse(readFileSync(resolvedPath, 'utf-8'))
        //console.log(`📦 Seeds carregados via arquivo: ${resolvedPath}`)
        console.log(`📦 Seeds carregados via arquivo: ${relativePath}`)
      } catch (error) {
        throw new Error(
          `❌ Erro ao ler arquivo de seed (${resolvedPath}): ${error}`
        )
      }
    } else {
      console.warn(`⚠️ Arquivo de seed não encontrado: ${resolvedPath}`)
    }
  } else {
    console.log('ℹ️ Nenhum seed definido. Tabelas serão criadas vazias.')
  }

  for (const params of tableConfigs) {
    const tableName = params.TableName

    if (!tableName) {
      throw new Error(
        '❌ TableName ausente em uma das configurações de tabela.'
      )
    }

    try {
      await dynamodb.send(new CreateTableCommand(params))
      console.log(`✅ Tabela criada: ${tableName}`)
    } catch (err: any) {
      if (err?.name === 'ResourceInUseException') {
        console.log(`ℹ️ Tabela já existe: ${tableName}`)
      } else {
        console.error(`❌ Erro ao criar tabela ${tableName}:`, err)
        continue
      }
    }

    const items = seeds[tableName]
    if (items && Array.isArray(items)) {
      for (const item of items) {
        try {
          await dynamodb.send(
            new PutItemCommand({
              TableName: tableName,
              Item: marshall(item)
            })
          )
          console.log(
            `📥 Item inserido em ${tableName}: ${item.id || '[sem id]'}`
          )
        } catch (error) {
          console.error(`❌ Erro ao inserir item em ${tableName}:`, error)
        }
      }
      try {
        const scan = await dynamodb.send(
          new ScanCommand({ TableName: tableName })
        )
        console.log(`🔎 Total de itens na tabela ${tableName}: ${scan.Count}`)
      } catch (error) {
        console.warn(
          `⚠️ Não foi possível escanear a tabela ${tableName}:`,
          error
        )
      }
    }
  }
}

createDynamoDBTables().catch(console.error)
