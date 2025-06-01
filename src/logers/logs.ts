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
  if (
    message.includes('InternalFailure') ||
    message.includes('Service') ||
    message.includes('is not enabled')
  ) {
    console.warn(`⚠️  Serviço ${service} não está habilitado no LocalStack.`)
  } else {
    console.error(`❌ Erro ao verificar ${service}:`, err)
  }
}
