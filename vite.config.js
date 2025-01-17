import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/start.js',
                'resources/js/core-listener.js',
                'resources/js/echo-esm.js',
                'resources/css/main.css',
                'resources/js/main-function.js',
            ],
            refresh: true,
        }),
        manifestSRI(),
    ],
    build: {
        target: 'esnext',
        rollupOptions: {
            preserveEntrySignatures: 'allow-extension',
        },
        // minify: false,
    }
});
