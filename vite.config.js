import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/start.js',
                'resources/js/svg-sprites-icon-loader.js',
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
