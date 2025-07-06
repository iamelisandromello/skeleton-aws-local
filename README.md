# SkeletonAWSLocal

![Version](https://img.shields.io/badge/version-1.8.0-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-green)
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
│       └── deleters-list-task.ts       # Tarefa de apoio lista os recursos disponíveis para exclusão
│       └── deleters-selectors-task.ts  # Tarefa de apoio do serviço de deleção de recursos
│       └── should-provision.ts         # Tarefa de apoio verifica disponibilidade dos recursos
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
Para utilizar os recursos da biblioteca **SkeletonAwsLocal** localmente, é necessário ter o [Docker](https://www.docker.com/) instalado, pois ele é responsável por subir os serviços simulados da AWS por meio do [LocalStack](https://docs.localstack.cloud/overview/).

✅ Pré-requisitos

1.  Instale o Docker Desktop (ou Docker Engine em sistemas Unix-like).

2.  Certifique-se de que o comando docker está disponível em seu terminal:

```bash
docker --version
```

### 📦 Inicializando o LocalStack
Este projeto já inclui um arquivo `docker-compose.yml` configurado com os serviços necessários (Lambda, SQS, S3, DynamoDB e API Gateway).

```docker
services:
  localstack:
    image: localstack/localstack:3.2
    container_name: localstack
    ports:
      - "4566:4566"     # Porta principal de serviços AWS
      - "4510-4559:4510-4559" # Outras portas internas
      - "8080:8080"     # UI
    environment:
      - SERVICES=lambda,sqs,s3,dynamodb,apigateway
      - DEBUG=1
      - DOCKER_HOST=unix:///var/run/docker.sock
      - AWS_ACCESS_KEY_ID=skeletonkeyid
      - AWS_SECRET_ACCESS_KEY=skeletonkey
      - AWS_REGION=us-east-1
      - LAMBDA_EXECUTOR=docker-reuse
      - LOCALSTACK_API_KEY=your-key-if-needed
    volumes:
      - ./localstack:/etc/localstack/init/ready.d  # scripts de inicialização
      - /var/run/docker.sock:/var/run/docker.sock

```

### 💡 Observação
O docker-compose.yml disponibilizado é extremamente simples, responsável por disponibilizar o [LocalStack](https://docs.localstack.cloud/overview/) em um container [Docker](https://www.docker.com/). Esta configuração é definida no **SkeletonAWSLocal**, o `projeto-consumer` não gerencia este recurso apenas o utiliza. Portanto se atente as configurações: `AWS_ACCESS_KEY_ID=skeletonkeyid
`, `AWS_SECRET_ACCESS_KEY=skeletonkey`, `AWS_REGION=us-east-1`que devem ser informadas em seu arquivo `.env`.
<br></br>

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
---

## 🌐  Habilitar Recursos a Serem Provisionados

Para definir quais recursos serão provisionados no `Localstack`, o **SkeletonAWSLocal** se utiliza de variáveis de ambientes que devem ser definidas no arquivo `.env` do projeto-consumer. Abaixo disponibilizo alguns exemplos para ilustrar a mecânica de disponibilização dos recursos.

- `BUCKET S3`: Para disponibilizar um bucker S3 no localstack, defina as duas variáveis abaixo o seu arquivo `.env`.

```env
CHECK_LOCALSTACK_S3=true
BUCKET_NAME=meu-unico-bucket-s3
```

- `LAMBDA`: Para disponibilizar uma lambda no localstack, defina as duas variáveis abaixo no seu arquivo `.env`.

```env
CHECK_LOCALSTACK_LAMBDA=true
LAMBDA_NAME=meu-lambda
```

- `API GATEWAY/ROUTES`: Para disponibilizar uma Api Gateway e definir rotas no localstack, é necessário definir algumas variáveis no seu arquivo `.env`. Esta variáveis vão definir o status de enable para provisionar o recurso, o nome que definiremos para o recurso e um array onde definimos o método e o path das rotas que desejamos provisionar

```env
CHECK_LOCALSTACK_APIGATEWAY=true
API_NAME=meu-api-gateway
API_ROUTES=[{"path":"/load","method":"GET"},{"path":"/create","method":"POST"},{"path":"/logout","method":"POST"}]
```

### 🆕 📦 Provisionamento de Múltiplas Tabelas DynamoDB com Seeds

A partir da versão 1.8.0, o SkeletonAWSLocal permite criar múltiplas tabelas DynamoDB e, opcionalmente, popular essas tabelas com dados iniciais automaticamente durante o processo de provisionamento.

Essa funcionalidade suporta dois modos híbridos de definição de dados:

> Via .env (modo inline — ideal para poucos dados)

> Via arquivo .seeds/dynamodb-seeds.json (modo externo — ideal para estruturas maiores e legibilidade)

#### ✅ Habilitando o recurso
```env
CHECK_LOCALSTACK_DYNAMODB=true
```

#### 🧱 Definindo múltiplas tabelas no .env

Use a variável ```DYNAMODB_TABLES``` para configurar todas as tabelas. O valor deve ser um JSON em uma única linha.

**Exemplo:**
```env
DYNAMODB_TABLES=[{"TableName":"customers","KeySchema":[{"AttributeName":"id","KeyType":"HASH"}],"AttributeDefinitions":[{"AttributeName":"id","AttributeType":"S"}],"ProvisionedThroughput":{"ReadCapacityUnits":5,"WriteCapacityUnits":5}},{"TableName":"orders","KeySchema":[{"AttributeName":"orderId","KeyType":"HASH"},{"AttributeName":"createdAt","KeyType":"RANGE"}],"AttributeDefinitions":[{"AttributeName":"orderId","AttributeType":"S"},{"AttributeName":"createdAt","AttributeType":"N"}],"ProvisionedThroughput":{"ReadCapacityUnits":10,"WriteCapacityUnits":10}}]
```

#### 📥 Populando as tabelas com dados iniciais (Seeds)
Você pode usar uma das abordagens abaixo, ou até combinar ambas:

**🅰️ Opção 1 — Definir os dados no .env**

```e
DYNAMODB_SEEDS={"customers":[{"id":"1","name":"Maria"}],"orders":[{"orderId":"X001","createdAt":20250705}]}
```

**🅱️ Opção 2 — Criar o arquivo .seeds/dynamodb-seeds.json**

> A biblioteca irá procurar automaticamente por este arquivo se a variável DYNAMODB_SEEDS não estiver definida no .env.

<P>
<B>Exemplo de conteúdo do .seeds/dynamodb-seeds.json</B>
</P>

```env
{
  "customers": [
    {
      "id": "45dccb77-ce71-4b23-8843-29489053b0bf",
      "name": "SONHO DE CASA ENXOVAIS LTDA",
      "email": "rosa_dapaz@easytechconsultoria.com.br",
      "phone": "13998443408",
      "document": "37378490000174",
      "trade_name": "Carolina ABC",
      "updated_at": "2025-07-03T16:55:24.036762",
      "created_at": "2025-07-03T16:55:24.036751",
      "companies": [
        {
          "id": "064b92ee-5a39-40c0-bb27-eb2ab05dd98e",
          "document": "20068768000104",
          "name": "VAREJAO MODAS SAO GONCALO LTDA",
          "main": false,
          "trade_name": "VAREJAO MODAS SAO GONCALO LTDA"
        },
        {
          "id": "2ee4883a-e1c4-4f9c-80c3-3209c780a1a0",
          "document": "43037250000109",
          "name": "HARDZ BRANDS LTDA",
          "main": false,
          "trade_name": "HARDZ BRANDS LTDA"
        }
      ]
    }
  ]
}

```

### 📋 Estratégia Híbrida

```
| Origem                       | Prioridade | Recomendado para            |
| ---------------------------- | ---------- | --------------------------- |
| `.env > DYNAMODB_SEEDS`      | Alta       | Dados pequenos/rápidos      |
| `.seeds/dynamodb-seeds.json` | Fallback   | Dados estruturados/legíveis |

```

#### ⚠️ Cuidados com o .env

- Use JSON válido compactado (sem quebras de linha).

- Utilize ferramentas como ```jsonformatter.org/minify``` para converter o conteúdo.

- O ```.env``` não deve conter comentários ou caracteres especiais fora do padrão key=value.

- Arquivos `.env` não suportam objetos ou arrays JSON com múltiplas linhas. Por padrão, variáveis em `.env` devem ser strings em uma única linha. 

#### 📦 Resultado
Ao executar o script de provisionamento, as tabelas são criadas com base em ```DYNAMODB_TABLES``` e os dados são automaticamente inseridos (via ```PutItemCommand```) com base no ```DYNAMODB_SEEDS``` ou no arquivo ```.seeds/dynamodb-seeds.json```.


## Ambiente via Variáveis de ambiente

Para que o projeto funcione corretamente com o LocalStack, é necessário configurar algumas variáveis de ambiente. Crie um arquivo .env na raiz do projeto com base no arquivo .env.example, que já contém os nomes das variáveis esperadas.

### 📄 Exemplo de .env

```env
TZ=UTC
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
LAMBDA_NAME=meu-lambda
CORS_ORIGIN_PERMISSION=*
API_NAME=meu-api-gateway
AWS_SECRET_ACCESS_KEY=test
BUCKET_NAME=meu-unico-bucket-s3
SQS_QUEUE_NAME=skeleton-local-stack-queue
LOCALSTACK_ENDPOINT=http://localhost:4566
EXAMPLE_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/125702582030/skeleton-pub-queue
API_ROUTES=[{"path":"/load","method":"GET"},{"path":"/create","method":"POST"},{"path":"/logout","method":"POST"}]

# Lista de tabelas a serem criadas no LocalStack
DYNAMODB_TABLES=[{"TableName": "customers","KeySchema": [{ "AttributeName": "id", "KeyType": "HASH" }],"AttributeDefinitions": [{ "AttributeName": "id", "AttributeType": "S" }],"ProvisionedThroughput": {"ReadCapacityUnits": 5,"WriteCapacityUnits": 5}}]

# Opção 1: Seed direto no .env (como string JSON)
DYNAMODB_SEEDS={"customers": [{"id": "uuid-123","name": "Exemplo Cliente","document": "12345678900000","created_at": "2025-07-05T12:00:00Z"}]}

# Opção 2: Caminho para arquivo JSON de seed
DYNAMODB_SEED_FILE=./seeds/dynamodb-seeds.json

CHECK_LOCALSTACK_S3=true
CHECK_LOCALSTACK_SQS=true
CHECK_LOCALSTACK_SNS=false
CHECK_LOCALSTACK_LAMBDA=true
CHECK_LOCALSTACK_DYNAMODB=true
CHECK_LOCALSTACK_KINESIS=false
CHECK_LOCALSTACK_APIGATEWAY=true
CHECK_LOCALSTACK_CLOUDWATCH=false
```

## 📌 Observações

Não utilize aspas (simples ou duplas) nos valores das variáveis no arquivo ```.env```, pois o ```dotenv-cli``` inclui as aspas literalmente durante o parsing, o que pode causar falhas inesperadas.

<br>**Exemplo errado:**

```env
AWS_REGION="us-east-1"
Resultado interpretado: "us-east-1" (com aspas duplas incluídas)
```

<br>**Exemplo correto:**

```env
AWS_REGION=us-east-1
```

Nunca adicione o arquivo `.env` ao Git. Ele deve estar no `.gitignore` para evitar exposição acidental de dados sensíveis, mesmo em ambiente local.

O `.env.example` serve como referência e não deve conter valores sensíveis reais.

Os valores fornecidos no `.env.example` são genéricos e compatíveis com o LocalStack. Eles podem ser usados como padrão caso você deseje inicializar rapidamente o projeto.

---

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

### 💡 Observação
Importante dizer que os scripts apresentados são fundamentais para o funcionameto dos recursos, pois executam comandos diretamente no `CLI` disponibilizado pelo **SkeletoAWSLocal**. Então, não os altere para garantir o funcionamento.Excetuando evidentemente o script de `build:local` que deve ser adeqaudo ao seu ambiente.


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
Este script aninha a chamada dos dois scripts: `package` e `provision`, que realiza o empacotamento do arquivo `.zip` e depois provisiona os recursos no LocalStack, preparando o ambiente para ser utilizado localmente.

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

### 🔁 Múltiplas execuções

Ao final de cada operação, o script perguntará se deseja executar novamente. Você pode continuar excluindo recursos sem reiniciar o CLI.

### 😔 Fallback

> Se nenhum recurso tenha sido provisionado no Localstack, será apresentado a seguinte mensage

```bash
🚦 Verificando status do LocalStack...

📡 Verificando saúde do LocalStack...
✅ LocalStack está rodando normalmente!

🔍 Selecione o recurso do LocalStack para verificar:

😔 Nenhum recurso do LocalStack está habilitado para verificação.Todos os recursos devem estar desabilitados no seu arquivo .env. Por favor, verifique sua configuração.

? Escolha uma opção: (Use arrow keys)
❯ Sair
```

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

### ▶️ Como funciona

Execute o script interativo:

```bash
npm run manage:resources
```

Você verá um menu como este:

```text
🧹 Gerenciador de recursos AWS - CLI

? Qual tipo de recurso você deseja gerenciar/excluir?
❯ Lambda Functions
  SQS Queues
  S3 Buckets
  DynamoDB Tables
  API Gateway (REST APIs)
  API Gateway (Routes)
 ──────────────
(Use arrow keys to reveal more choices)
```

Após a escolha, você será solicitado a fornecer um padrão (regex ou nome exato) para filtrar os recursos a excluir.

### 🔁 Múltiplas execuções

Ao final de cada operação, o script perguntará se deseja executar novamente. Você pode continuar excluindo recursos sem reiniciar o CLI.


### 😔 Fallback

> Se nenhum recurso tenha sido provisionado no Localstack, será apresentado a seguinte mensage.

```bash
🚦 Verificando status do LocalStack...

📡 Verificando saúde do LocalStack...
✅ LocalStack está rodando normalmente!

🧹 Gerenciador de recursos AWS - CLI:

😔 Nenhum tipo de recurso está habilitado para exclusão no momento. Por favor, verifique sua configuração de recursos no LocalStack.
? Qual tipo de recurso você deseja gerenciar/excluir? (Use arrow keys)
❯ Sair do Gerenciador

```

### ⚠️ Aviso

> Este CLI **apaga recursos**. Use com cautela, especialmente fora de ambientes de teste/LocalStack.

### Importante

Tanto na execução do `manage:resources` quanto `check:resourses`, no caso do Localstack esteja indisponível no seu ambiente local, conteinar do Docker off por exemplo, será apresentado a mensagem abaixo:

```bash
🚦 Verificando status do LocalStack...

📡 Verificando saúde do LocalStack...
🛑 Não foi possível conectar ao LocalStack.
💡 Certifique-se de que o container está rodando (porta 4566).

    🚫 LocalStack está OFFLINE
    ──────────────────────────────────────────────
    💡 Verifique se o container está ativo:
       docker ps | grep localstack
    🔄 Reinicie com:
       docker-compose up -d localstack
    📚 Documentação:
       https://docs.localstack.cloud/getting-started/
    ──────────────────────────────────────────────
❌ LocalStack não está em execução. Por favor, inicie o LocalStack e tente novamente.
```

---

## 🚀 Clonar Projeto

clone o repositório e rode localmente:

```bash
git clone https://github.com/iamelisandromello/localstack-template.git
cd localstack-template
npm install
```

---

## 👤 Autor

**Elisandro M Correa**  
📧 iamelicorrea@gmail.com  
🔗 [github.com/iamelisandromello/skeleton-aws-local](https://github.com/iamelisandromello/skeleton-aws-local)

---

## 📝 Licença

MIT
