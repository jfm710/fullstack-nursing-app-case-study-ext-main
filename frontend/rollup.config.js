import typescript from '@rollup/plugin-typescript';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
    input: './src/index.html',
    output: {
        dir: 'dist',
        format: 'es',
        sourcemap: !isProduction,
        entryFileNames: 'assets/bundle.[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
    },
    plugins: [
        html(),
        html({
            input: './pages/*.html',
            rootDir: './',
        }),
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
            // Add any other environment variables your application needs:
            // 'process.env.API_URL': JSON.stringify(isProduction ? 'https://api.example.com' : 'http://localhost:3001'),
        }),
        resolve({
            browser: true,
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: !isProduction,
            inlineSources: !isProduction,
        }),
        babel({
            presets: ['@babel/preset-react'],
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            babelHelpers: 'bundled',
            exclude: 'node_modules/**',
        }),
        isProduction && terser(),
    ],
};
