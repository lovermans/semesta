import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import manifestSRI from 'vite-plugin-manifest-sri';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/asset.js',
                'resources/js/theme.js',
                'resources/js/websocket.js',
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
