// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    host: "0.0.0.0",
    https: {
      key: "cert.key", // Укажите путь к вашему ключу
      cert: "cert.crt", // Укажите путь к вашему сертификату
    },
  },
  modules: ["@vite-pwa/nuxt"],
  pwa: {
    manifest: {
      name: "Service",
      short_name: "Serv",
      display: "standalone",
      theme_color: "blue",
      description: "This test a service",
      orientation: "portrait-primary",

      icons: [
        {
          src: "icons/cat1.png",
          sizes: "48x48",
          type: "image/png",
        },
        {
          src: "icons/cat2.png",
          sizes: "72x72",
          type: "image/png",
        },
        {
          src: "icons/cat3.png",
          sizes: "96x96",
          type: "image/png",
        },
        {
          src: "icons/cat4.png",
          sizes: "144x144",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "screenshots/cat5.png",
          type: "image/png",
          sizes: "720x540",
          form_factor: "narrow",
        },
        {
          src: "screenshots/cat5.png",
          type: "image/png",
          sizes: "720x540",
          form_factor: "wide",
        },
      ],
    },
    workbox: {
      globDirectory: "C:/Users/anilla/Desktop/testing/test/.nuxt/dev-sw-dist",
      globIgnores: ["**/node_modules/**/*", "sw.js", "workbox-*.js"],

      navigateFallback: "/",
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },
});
