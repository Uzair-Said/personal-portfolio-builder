const esbuild = require('esbuild')
const fs = require('fs')
const path = require('path')

const root = __dirname
const distDir = path.join(root, 'dist')
const publicDir = path.join(root, 'public')

fs.rmSync(distDir, { recursive: true, force: true })
fs.mkdirSync(distDir, { recursive: true })
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true })
}

esbuild.build({
  entryPoints: [path.join(root, 'src', 'main.tsx')],
  outdir: path.join(distDir, 'assets'),
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ['es2020'],
  format: 'iife',
  jsx: 'automatic',
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file',
    '.webp': 'file',
  },
  assetNames: '[name]-[hash]',
  entryNames: '[name]-[hash]',
}).then(() => {
  const sourceIndex = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  const files = fs.readdirSync(path.join(distDir, 'assets'))
  const appFile = files.find((file) => /^main-.*\.js$/.test(file))
  const cssFile = files.find((file) => /^main-.*\.css$/.test(file))
  if (!appFile) throw new Error('Application bundle was not created')

  const outputIndex = sourceIndex
    .replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/, `<script src="/assets/${appFile}" defer></script>`)
    .replace('</head>', cssFile ? `  <link rel="stylesheet" href="/assets/${cssFile}" />\n  </head>` : '</head>')
  fs.writeFileSync(path.join(distDir, 'index.html'), outputIndex)
  console.log(`Portfolio build complete: ${appFile}`)
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
