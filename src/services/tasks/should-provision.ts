import { variables } from '../../main/variables'

export function shouldProvisionOrExit(
  resource: keyof typeof variables.checkLocalstack
): void {
  const isEnabled = variables.checkLocalstack[resource]

  if (!isEnabled) {
    console.log(
      `⏭️ Provisionamento de ${resource.toUpperCase()} ignorado (CHECK_LOCALSTACK_${resource.toUpperCase()}=false).`
    )
    process.exit(0)
  }
}
