import * as path from 'node:path'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'

export default async function provisionResources(lambdaZipPath: string) {
  const scriptPath = path.resolve(
    __dirname,
    '../../localstack/init-resources.sh'
  )

  console.log('🧭 __dirname:', __dirname)
  console.log('🧭 process.cwd():', process.cwd())
  console.log('🧭 Resolvendo path para init-resources.sh:', scriptPath)
  console.log('🧭 Lambda ZIP Path recebido:', lambdaZipPath)

  if (!existsSync(scriptPath)) {
    throw new Error(`Script init-resources.sh não encontrado em: ${scriptPath}`)
  }

  console.log(`Executando init-resources.sh com lambdaZip: ${lambdaZipPath}`)

  return new Promise<void>((resolve, reject) => {
    const child = spawn('bash', [scriptPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        LAMBDA_ZIP: lambdaZipPath
      }
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`init-resources.sh falhou com código ${code}`))
      }
    })
  })
}
