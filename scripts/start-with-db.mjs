import { spawn } from 'node:child_process'
import { startLocalMongoServer } from './local-mongo-server.mjs'

const mode = process.argv[2] === 'start' ? 'start' : 'dev'

async function main() {
  await startLocalMongoServer(27017, '127.0.0.1')

  const child = spawn(
    'npx',
    ['next', mode, '--hostname', '0.0.0.0', '--port', process.env.PORT || '3000'],
    {
      stdio: 'inherit',
      env: { ...process.env },
    },
  )

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
