import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/main.js',
                'resources/js/theme.js',
                'resources/js/websocket-lib.js',
                'resources/css/main.css',
            ],
            refresh: true,
        }),
        manifestSRI(),
    ],
    build: {
        target: 'esnext',
        // minify: false,
    }
});
