import {
    defineConfig
}
from "vite";

export default defineConfig({

    resolve: {

        preserveSymlinks:
            true
    },

    optimizeDeps: {

        exclude: [

            "@babylonjs/core",

            "@babylonjs/gui"
        ]
    },

    server: {

        proxy: {

            "/api": {

                target:
                    "http://localhost:3000",

                changeOrigin:
                    true
            }
        }
    }
});