import packageLambda from './package-lambda'

import { resolve } from 'node:path'

const distPath = resolve(__dirname, '../dist')
const nodeModulesPath = resolve(__dirname, '../node_modules')
const outputPath = resolve(__dirname, '../../localstack/lambda.zip')

packageLambda(distPath, nodeModulesPath, outputPath).catch((err) => {
  console.error('Erro ao criar zip da Lambda:', err)
  process.exit(1)
})
