import { lambda, LAMBDA_NAME } from '../../localstack/aws-config'

import fs from 'node:fs'
import path from 'node:path'
import { CreateFunctionCommand } from '@aws-sdk/client-lambda'

const functionName = LAMBDA_NAME

const zipFilePathEnv = process.env.LAMBDA_ZIP

if (!zipFilePathEnv) {
  console.error('❌ Variável de ambiente LAMBDA_ZIP não definida.')
  process.exit(1)
}

if (!fs.existsSync(zipFilePathEnv)) {
  console.error(`❌ Arquivo não encontrado: ${zipFilePathEnv}`)
  process.exit(1)
}

const zipFilePath: string = zipFilePathEnv

console.log('🧩 Executando create-lambda.js')
console.log('🧩 __dirname:', __dirname)
console.log('🧩 process.cwd():', process.cwd())
console.log(
  '🧩 Esperado: create-lambda.js esteja em localstack-template/dist/scripts/localstack'
)
console.log('🧩 Lendo arquivo ZIP de:', zipFilePath)

async function createLambda() {
  const zipBuffer = fs.readFileSync(zipFilePath)

  try {
    const command = new CreateFunctionCommand({
      FunctionName: functionName,
      Runtime: 'nodejs18.x',
      Role: 'arn:aws:iam::000000000000:role/lambda-role',
      Handler: 'main/index.handler',
      Code: { ZipFile: zipBuffer },
      Publish: true
    })

    await lambda.send(command)
    console.log(`✅ Lambda criada: ${functionName}`)
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name: string }).name === 'ResourceConflictException'
    ) {
      console.log(`ℹ️ Lambda '${functionName}' já existe.`)
    } else {
      console.error('❌ Erro ao criar Lambda:', err)
    }
  }
}

createLambda()
