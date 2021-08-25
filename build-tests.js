const fg = require('fast-glob');
const fs = require('fs');
const esbuild = require('esbuild');

const externalPackages = ['react', 'react-dom'];
let makePackagesExternalPlugin = {
  name: 'make-packages-external',
  setup(build) {
    let filter = /.*/;
    build.onResolve({ namespace: 'file', filter }, (args) => {
      // To allow sub imports from packages we take only the first path to deduct the name
      let moduleName = args.path.split('/')[0];

      // In case of scoped package
      if (args.path.startsWith('@')) {
        const split = args.path.split('/');
        moduleName = `${split[0]}/${split[1]}`;
      }

      if (externalPackages.includes(moduleName)) {
        return { path: args.path, external: true };
      }

      return null;
    });
  },
};

const allTestFiles = fg.sync(`./src/__tests__/**/*.test.{ts,tsx}`).map((f) => f.replace('src/__tests__/', ''));
const importsFileStr = allTestFiles.map((file) => `require('${file}');`).join('\n');

fs.writeFileSync('./src/__tests__/test-files-index.ts', importsFileStr);

esbuild
  .build({
    bundle: true,
    sourcemap: true,
    loader: {
      '.svg': 'text',
    },
    define: { 'process.env.NODE_ENV': '"test"' },
    plugins: [makePackagesExternalPlugin],
    external: ['*.woff', '*.ttf', '*.eot?#iefix'],
    entryPoints: ['./src/__tests__/test-files-index.ts'],
    outfile: './src/__tests__/bundles/test-files-bundle.js',
  })
  .then(() => {
    fs.unlinkSync('./src/__tests__/test-files-index.ts');
  });
