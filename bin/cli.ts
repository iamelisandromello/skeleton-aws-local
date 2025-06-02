#!/usr/bin/env node
// CLI Version: v0.5.2

import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const [, , command, ...args] = process.argv

async function run() {
  switch (command) {
    case 'package': {
      const [distDir, nodeModulesDir, outputZip] = args

      if (!distDir || !nodeModulesDir || !outputZip) {
        console.error('❌ Parâmetros insuficientes para o comando `package`.')
        console.log(
          'Uso correto: localstack-template package <distDir> <nodeModulesDir> <outputZip>'
        )
        process.exit(1)
      }

      const { default: packageLambda } = await import(
        '../src/services/package-lambda'
      )
      await packageLambda(distDir, nodeModulesDir, outputZip)
      break
    }

    case 'provision': {
      const [lambdaZip] = args

      if (!lambdaZip) {
        console.error('❌ Caminho do arquivo ZIP da Lambda não informado.')
        console.log('Uso correto: localstack-template provision <lambdaZip>')
        process.exit(1)
      }

      const zipPath = resolve(lambdaZip)
      if (!existsSync(zipPath)) {
        console.error(`❌ Arquivo ZIP não encontrado: ${zipPath}`)
        process.exit(1)
      }

      const { default: provisionResources } = await import(
        '../src/services/provision-resources'
      )
      await provisionResources(zipPath)
      break
    }

    case 'check': {
      const checkScript = resolve(
        __dirname,
        '../src/services/check-resources.js'
      )
      execSync(`node ${checkScript}`, { stdio: 'inherit', env: process.env })
      break
    }

    case 'manage': {
      const manageScript = resolve(
        __dirname,
        '../src/services/manage-resources.js'
      )
      execSync(`node ${manageScript}`, { stdio: 'inherit', env: process.env })
      break
    }

    case '--help':
    case '-h': {
      printHelp()
      break
    }

    default: {
      console.error(`❌ Comando desconhecido: ${command}`)
      printHelp()
      process.exit(1)
    }
  }
}

function printHelp() {
  console.log(`
📦 Comandos disponíveis:

  ▶ package <distDir> <nodeModulesDir> <outputZip>
     Empacota a função Lambda com suas dependências.

  ▶ provision <lambdaZip>
     Provisiona recursos no LocalStack com base no pacote ZIP informado.

  ▶ check
     Verifica os recursos provisionados no LocalStack.

  ▶ manage
     Exclui recursos do LocalStack de forma interativa via prompt.

  ▶ --help / -h
     Exibe esta ajuda.
  `)
}

run().catch((err) => {
  console.error('❌ Erro ao executar CLI:', err)
  process.exit(1)
})
