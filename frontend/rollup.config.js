import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
    input: './index.ts',
    output: [
        {
            file: "dist/index.js",
            format: 'cjs', // commonJS
            sourcemap: true,
        },
        {
            file: "dist/index.es.js",
            format: 'esm', // ES Modules
            sourcemap: true,
        },
    ],
    plugins: [
        peerDepsExternal(),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        commonjs({
            exclude: 'node_modules',
            ignoreGlobal: true,
        }),
    ]
};
