// tsc only emits JavaScript, so copy the runtime assets (SQL migrations, seed, OpenAPI contract) to dist/.
const { cpSync } = require('node:fs')

cpSync('src', 'dist', {
  recursive: true,
  filter: (path) => !path.endsWith('.ts') && !path.includes('tests'),
})
