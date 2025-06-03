import { resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'

export function loadEnvFromConsumer() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return

  const lines = readFileSync(envPath, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))

  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (!process.env[key]) {
      process.env[key] = rest.join('=').trim()
    }
  }
}
