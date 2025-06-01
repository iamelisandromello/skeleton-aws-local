import { LAMBDA_NAME, lambda } from '../../localstack/aws-config'

import { InvokeCommand } from '@aws-sdk/client-lambda'

async function invokeLambda() {
  try {
    const response = await lambda.send(
      new InvokeCommand({
        FunctionName: LAMBDA_NAME,
        Payload: Buffer.from(JSON.stringify({ message: 'Hello from local' }))
      })
    )

    const payload = response.Payload
      ? JSON.parse(Buffer.from(response.Payload).toString())
      : null

    console.log('✅ Resposta da Lambda:', payload)
  } catch (err) {
    console.error('❌ Erro ao invocar a Lambda:', err)
  }
}

invokeLambda()
