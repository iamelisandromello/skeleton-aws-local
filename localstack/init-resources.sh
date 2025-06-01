#!/bin/bash
# init-resources Version: v0.3

echo "▶️ Inicializando recursos no LocalStack..."

SCRIPT_PATH=$(realpath "$0")
SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

echo "🔍 Diretório atual (pwd): $(pwd)"
echo "🔍 Caminho do script: $0"
echo "🔍 Caminho absoluto do script: $SCRIPT_PATH"
echo "🔍 Caminho do lambdaZip recebido: $1"
echo "🔍 Diretório do script: $SCRIPT_DIR"

# Detectar se estamos rodando de dist/localstack ou localstack
if [[ "$SCRIPT_DIR" == */dist/localstack ]]; then
  TEMPLATE_ROOT=$(realpath "$SCRIPT_DIR/../..")
elif [[ "$SCRIPT_DIR" == */localstack ]]; then
  TEMPLATE_ROOT=$(realpath "$SCRIPT_DIR/..")
else
  echo "❌ Estrutura de diretórios inesperada. Abortando."
  exit 1
fi

echo "📦 Diretório base do localstack-template: $TEMPLATE_ROOT"

if [[ "$SCRIPT_DIR" == */dist/localstack ]]; then
  USE_TS_NODE=false
else
  USE_TS_NODE=true
fi

run() {
  if [ "$USE_TS_NODE" = true ]; then
    echo "🔧 Executando com ts-node: $1.ts"
    npx ts-node "$TEMPLATE_ROOT/src/localstack/$1.ts"
  else
    echo "🔧 Executando com node: $1.js"
    node "$TEMPLATE_ROOT/dist/src/localstack/$1.js"
  fi
}

run create-lambda
run create-sqs
run create-s3
run create-dynamodb
run create-api-gateway

echo "✅ Recursos provisionados com sucesso!"
