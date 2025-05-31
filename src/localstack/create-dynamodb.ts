import { dynamodb } from './aws-config'

import {
  CreateTableCommand,
  type CreateTableCommandInput,
  ResourceInUseException
} from '@aws-sdk/client-dynamodb'

async function createDynamoDBTable() {
  const params: CreateTableCommandInput = {
    TableName: 'Users',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }], // 'S' de String
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }

  try {
    await dynamodb.send(new CreateTableCommand(params))
    console.log('✅ Tabela DynamoDB criada: Users')
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name: string }).name === 'ResourceInUseException'
    ) {
      console.log('ℹ️ Tabela já existe: Users')
    } else {
      console.error('❌ Erro ao criar tabela:', err)
    }
  }
}

createDynamoDBTable().catch(console.error)
