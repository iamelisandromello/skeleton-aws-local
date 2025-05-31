import * as fs from 'node:fs'
import * as path from 'node:path'
import archiver from 'archiver'

export default async function packageLambda(
  distDir: string,
  nodeModulesDir: string,
  outputZipPath: string
) {
  // 🔧 Garante que o diretório onde será salvo o zip existe
  const outputDir = path.dirname(outputZipPath)
  fs.mkdirSync(outputDir, { recursive: true }) // <-- isso resolve o erro

  const output = fs.createWriteStream(outputZipPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  return new Promise<void>((resolve, reject) => {
    output.on('close', () => {
      console.log(
        `Arquivo zip criado em: ${outputZipPath} (${archive.pointer()} bytes)`
      )
      resolve()
    })

    archive.on('error', (err: Error) => reject(err))

    archive.pipe(output)

    archive.directory(distDir, '')
    archive.directory(nodeModulesDir, 'node_modules')

    archive.finalize()
  })
}
