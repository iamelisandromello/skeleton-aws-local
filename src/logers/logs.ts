export function logResult<T>(
  label: string,
  data: T[] | undefined | null,
  transform?: (item: T) => unknown
) {
  if (!data || data.length === 0) {
    console.warn(`⚠️  ${label} não encontrados.`)
    return
  }

  const items = transform ? data.map(transform) : data
  console.log(`✅ ${label}:`, items)
}

export function logError(service: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err)

  const hasCode = (e: unknown): e is { code: string } =>
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    typeof (e as { code: unknown }).code === 'string'

  const knownNetworkErrors = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'EHOSTUNREACH',
    'ETIMEDOUT'
  ]

  if (
    message.includes('InternalFailure') ||
    message.includes('Service') ||
    message.includes('is not enabled')
  ) {
    console.warn(`⚠️  O serviço ${service} não está habilitado no LocalStack.`)
    return
  }

  if (hasCode(err) && knownNetworkErrors.includes(err.code)) {
    console.error(`❌ Erro de conexão ao ${service}.`)
    console.info(
      '💡 Verifique se o LocalStack está rodando em http://localhost:4566'
    )
    return
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    console.error(`⏱️ Timeout ao acessar o serviço ${service}.`)
    return
  }

  console.error(`❌ Erro inesperado ao acessar ${service}: ${message}`)
}

export function showLocalStackDocsLink() {
  console.error(`
    🚫 LocalStack está OFFLINE
    ──────────────────────────────────────────────
    💡 Verifique se o container está ativo:
       docker ps | grep localstack
    🔄 Reinicie com:
       docker-compose up -d localstack
    📚 Documentação:
       https://docs.localstack.cloud/getting-started/
    ──────────────────────────────────────────────`)
}
