# SkeletonAWSLocal

![Version](https://img.shields.io/badge/version-0.5.2-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tested](https://img.shields.io/badge/tests-passing-brightgreen)

> Template CLI para provisionamento, verificação, empacotamento e gerenciamento de recursos LocalStack.

**Clean Architecture Template com suporte a LocalStack para gerenciamento de recursos AWS simulados.**

---

## 📁 Estrutura do Projeto
```
.
├── .github/
│   └── workflows                 # Pipeline GitHub Actions   
│     └── release.yml       
├── bin/
│   ├── cli.ts/                   # CLI de comandos do template
├── dist/                         # Arquivos transpilados após build
│   ├── bin/                    
│   ├── localstack/             
│   └── scripts/                
├── localstack/  
│   ├── aws-config.ts             # Configurações e credenciais AWS                
│   ├── init-resources.sh         # Inicialização dos recursos do LocalStack
│   └── localstack-config.ts      # Configurações do Skeleton Local Stack
├── src/                    
│   └── services/                       # Serviços de gerenciamento dos recursos Localstack
│     ├── check-resources.ts            # Verifica os recursos disponíveis no LocalStack
│     ├── deleters-resources.sh         # Exclui recursos setados para exclusão
│     ├── manage-resources.ts           # Gerencia exclusão de recursos no LocalStack
│     ├── package-lambda-run.ts         # Serviço de chamada do encapsulamento para Lambda.zip
│     ├── package-lambda.ts             # Encapsula o diretório dist do projeto consumer para o lambda.zip
│     ├── provision-resources.ts        # Provisionamento dos recursos a partir do lambda.zip
│     ├── selectors.ts                  # Seletor de recursos a serem excluídos
│     └── tasks/                        # Serviços de gerenciamento dos recursos Localstack
│       ├── checkers-task.ts            # Tarefa de apoio do serviço de verificação dos recursos
│       └── deleters-selectors-task.ts  # Tarefa de apoio do serviço de deleção de recursos
│   └── localstack                      # Scripts de criação de recursos AWS simulados    
│     ├── create-api-gateway.ts 
│     ├── create-dynamodb.ts    
│     ├── create-lambda.ts      
│     ├── create-s3.ts 
│     ├── create-sqs.ts           
│     └── invoke-lambda.ts     
│   └── logers                    # Abstração para centralizar a construção de logs   
│     └── logs.ts       
├── docs/                         # Documentação do projeto
├── .vscode/                      # Configurações do VS Code
├── node_modules/                 # Dependências do projeto
├── .env                          # Variáveis de ambiente
├── .env.example                  # Exemplo de variáveis de ambiente
├── .editorconfig                 # Configurações do editor
├── .gitignore                    # Arquivos ignorados pelo Git
├── biome.json                    # Configuração do Biome (formatação e linting)
├── docker-compose.yml            # Configuração do Docker
├── jest.config.js                # Configuração do Jest
├── package.json                  # Dependências e scripts
├── tsconfig.json                 # Configuração do TypeScript
└── tsconfig-build.json           # Configuração de build do TypeScript
```
---
## 🐳 Executando o LocalStack com Docker
Para utilizar os recursos da biblioteca skeleton-aws-local localmente, é necessário ter o [Docker](https://www.docker.com/) instalado, pois ele é responsável por subir os serviços simulados da AWS por meio do [LocalStack](https://docs.localstack.cloud/overview/).

✅ Pré-requisitos

1.  Instale o Docker Desktop (ou Docker Engine em sistemas Unix-like).

2.  Certifique-se de que o comando docker está disponível em seu terminal:

```bash
docker --version
```

### 📦 Inicializando o LocalStack
Este projeto já inclui um arquivo docker-compose.yml configurado com os serviços necessários (Lambda, SQS, S3, DynamoDB e API Gateway).

### 🔁 Scripts automatizados (package.json)
Adicione os seguintes scripts no seu package.json para facilitar o uso:

```json
"scripts": {
  "localstack:up": "skeleton-aws-local localstack:up",
  "localstack:down": "skeleton-aws-local localstack:down",
  "localstack:restart": "npm run localstack:down && npm run localstack:up"
}
````

#### ▶️ Exemplos de uso:
```bash
# Iniciar LocalStack
npm run localstack:up

# Parar o container
npm run localstack:down

# Reiniciar o ambiente
npm run localstack:restart
```

#### Passo a passo
1. Suba os serviços:
Suba os serviços:

```bash
npm run localstack:up
````

2. Verifique se o container está rodando:
```bash
docker ps
````

> O LocalStack será configurado automaticamente com os recursos definidos nos scripts contidos em ./localstack, utilizando os valores das variáveis no arquivo .env.

---

## 🚀 Instalação

```bash
npm install -D localstack-template
````

## 🔁 Dependências

Para utilizar o SkeletonAWSLocal é importante instalar algumas dependências para que todos os recursos funcionem adequadamente.

- `rimraf`: Para facilitar a construção e exclusão do diretório dist durante o build

```bash
npm install rimraf
```

- `dotenv-cli`: Para facilitar o carregamento automático das variáveis durante a execução dos scripts no projeto-consumer acessando o CLI do `SkeletonAWSLocal`

```bash
npm install --save-dev dotenv-cli
```

## 🧪 Scripts Úteis

Abaixo os scripts que devem ser incluídos no **`packaje.json`** no projeto-consumer, para facilitar a operação dos recursos do `SkeletonAWSLocal` utilizando o CLI integrado.

```json
"scripts": {
  "clean": "rimraf dist",
  "build:local": "npm run clean && tsc -p tsconfig.json",
  "package": "dotenv -- skeleton-aws-local package ./dist ./node_modules ./localstack/lambda.zip",
  "provision": "dotenv -- skeleton-aws-local provision ./localstack/lambda.zip",
  "prepare": "npm run package && npm run provision",
  "check:resources": "skeleton-aws-local check",
  "manage:resources": "skeleton-aws-local manage"
}
````

---

## 🛠️ Recursos suportados

Este projeto permite disponibilizar recursos locais da AWS, para ambientes de desenvolvimento, utilizando o LocalStack. Possibilitando testar o fluxo de integração do código desenvolvido com os recursos AWS, sem a necessidade do build para ambiente em cloud. Trazendo agilidade e dinamismo para o desenvolvimento de soluções que utilizem recursos AWS.

| Tipo              | Descrição                                     |
|-------------------|-----------------------------------------------|
| `lambda`          | Funções AWS Lambda                            |
| `sqs`             | Filas do Simple Queue Service                 |
| `s3`              | Buckets do Simple Storage Service             |
| `dynamodb`        | Tabelas do DynamoDB                           |
| `apigateway`      | APIs REST do API Gateway                      |
| `apigateway-route`| Rotas (resources) de uma API no API Gateway   |

---

## 🔁 Exemplo de uso no projeto consumer

### 📥 Comandos disponíveis


#### `build:local`

```code
npm run build:local
```

Executa o build do código fonte transpilando TypeScript em JavaSript. O script definido no `pacakge.json` exclui, caso exista, o diretório `./dist`. Executa o processo de build definido no arquivo de `tsconfig.json` e após gerar o código transpilado cria a pasta `./dist`. 


#### `package <distDir> <nodeModulesDir> <outputZip>`
```code
npm run package
```
Empacota uma função Lambda com suas dependências. O script definido no `pacakge.json` define os diretórios `./dist` e `./node_modules` para serem empacotados no arquivo `.zip` e define o local **`./localstack`** para salvar o pacote.

> Obs: se o seu código TypeScript é transpilado em outro local, não no diretório `./dist` do projeto, altere o script no `package.json`.

#### `provision <lambdaZip>`

```code
npm run provision
```

Provisiona recursos no LocalStack com base no arquivo ZIP empacotado no diretório `./localstack`. O script definido no `pacakge.json` inicia o `CLI` do **`SkeletonAWSLocal`**, passando como parâmetro o `./localstack/lambda.zip`, iniciando o processo de provisionamento dos recursos, definidos no .`env`,  no container do LocalStack.

#### `prepare`

```code
npm run prepare
```
Este script aninha a chamada dos dois scripts: package e provision, que realiza o empacotamento do arquivo .zip e depois provisiona os recursos no LocalStack, preparando o ambiente para ser utilizado localmente.

#### `check:resources`
```code
npm run check:resources
```

Lista todos os recursos provisionados no LocalStack, através do prompt interativo disponibilizado pleo `CLI` do **`SkeletonAWSLocal˜**.

#### `manage:resources`
```code
npm run manage:resources
```

Permite excluir recursos (Lambda, SQS, DynamoDB, etc.) com base em filtros via prompt interativo.

---

## 🔍 Verificação interativa de recursos (`check-resources.ts`)

O comando `check:resources` permite listar os recursos existentes no LocalStack de forma **interativa** com suporte ao [Inquirer.js](https://www.npmjs.com/package/inquirer).

### ▶️ Como funciona

Ao rodar:

```bash
npm run check:resources
```

Você verá um menu como este:

```text
? Qual recurso deseja visualizar? (Use as setas)
❯ lambda
  sqs
  s3
  dynamodb
  apigateway
  apigateway-route
  sair
```

- ✅ Após escolher um tipo de recurso (ex: `sqs`), o script exibirá todos os recursos daquele tipo atualmente disponíveis no LocalStack.
- 🔁 Ao final da exibição, você poderá escolher outro recurso para visualizar **sem reiniciar o script**.
- ❌ A opção `sair` encerra a execução.

### ✅ Recursos suportados

- Lambda
- SQS
- S3
- DynamoDB
- API Gateway
- Rotas do API Gateway

---

## Manage Resources SkeletonAWSLocal CLI

Este CLI permite a exclusão interativa de recursos AWS simulados no LocalStack, suportando múltiplas execuções sem reiniciar o script.

## ✨ Funcionalidades

- Exclusão seletiva de recursos:
  - Lambda Functions
  - SQS Queues
  - S3 Buckets
  - DynamoDB Tables
  - API Gateway (REST APIs)
  - API Gateway Routes

- Suporte a expressões regulares (regex)
- Execução em loop: permite múltiplas operações sem reiniciar o CLI
- Interface interativa via [Inquirer.js](https://www.npmjs.com/package/inquirer)

---

## ▶️ Uso

Execute o script interativo:

```bash
npm run manage:resources
```

Você verá um menu como este:

```text
? Qual recurso deseja excluir? (Use as setas)
❯ lambda
  sqs
  s3
  dynamodb
  apigateway
  apigateway-route
  sair
```

Após a escolha, você será solicitado a fornecer um padrão (regex ou nome exato) para filtrar os recursos a excluir.

### 🔁 Múltiplas execuções

Ao final de cada operação, o script perguntará se deseja executar novamente. Você pode continuar excluindo recursos sem reiniciar o CLI.

### ⚠️ Aviso

> Este CLI **apaga recursos**. Use com cautela, especialmente fora de ambientes de teste/LocalStack.

---

## 🚀 Clonar Projeto

clone o repositório e rode localmente:

```bash
git clone https://github.com/iamelisandromello/localstack-template.git
cd localstack-template
npm install
```

---

## 🌐  Variáveis de Ambiente

Para que o projeto funcione corretamente com o LocalStack, é necessário configurar algumas variáveis de ambiente. Crie um arquivo .env na raiz do projeto com base no arquivo .env.example, que já contém os nomes das variáveis esperadas.

### 📄 Exemplo de .env

```env
TZ=UTC
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

LAMBDA_NAME=meu-lambda
API_NAME=meu-api-gateway
CORS_ORIGIN_PERMISSION=*
BUCKET_NAME=meu-unico-bucket-s3
SQS_QUEUE_NAME=skeleton-local-stack-queue
EXAMPLE_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/125702582030/skeleton-pub-queue
LOCALSTACK_ENDPOINT=http://localhost:4566

CHECK_LOCALSTACK_S3=true
CHECK_LOCALSTACK_SQS=true
CHECK_LOCALSTACK_SNS=false
CHECK_LOCALSTACK_LAMBDA=true
CHECK_LOCALSTACK_DYNAMODB=true
CHECK_LOCALSTACK_KINESIS=false
CHECK_LOCALSTACK_APIGATEWAY=true
CHECK_LOCALSTACK_CLOUDWATCH=false

API_ROUTES=[{"path":"/load","method":"GET"},{"path":"/create","method":"POST"},{"path":"/logout","method":"POST"}]
```

## 📌 Observações

Não utilize aspas (simples ou duplas) nos valores das variáveis no arquivo .env, pois o dotenv-cli inclui as aspas literalmente durante o parsing, o que pode causar falhas inesperadas.
<br>Exemplo errado:

```env
AWS_REGION="us-east-1"
Resultado interpretado: "us-east-1" (com aspas duplas incluídas)
```

<br>Exemplo correto:

```env
AWS_REGION=us-east-1
```

Nunca adicione o arquivo `.env` ao Git. Ele deve estar no `.gitignore` para evitar exposição acidental de dados sensíveis, mesmo em ambiente local.

O `.env.example` serve como referência e não deve conter valores sensíveis reais.

Os valores fornecidos no `.env.example` são genéricos e compatíveis com o LocalStack. Eles podem ser usados como padrão caso você deseje inicializar rapidamente o projeto.



---

## 👤 Autor

**Elisandro M Correa**  
📧 iamelicorrea@gmail.com  
🔗 [github.com/iamelisandromello/skeleton-aws-local](https://github.com/iamelisandromello/skeleton-aws-local)

---

## 📝 Licença

MIT
