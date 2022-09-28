import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';
import templateStringOptimize from 'rollup-plugin-template-string-optimize';

const packageJson = require('./package.json');

export default [
  {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [resolve(), commonjs(), templateStringOptimize(), typescript({ tsconfig: './tsconfig.json' }), postcss()]
  },
  {
    input: 'dist/esm/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts(), image({ dom: true })],
    external: [/\.(css|less|scss)$/]
  }
];

// "@rollup/plugin-typescript": "~8.3.3",
