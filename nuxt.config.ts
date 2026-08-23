// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ["@pinia/nuxt", "@nuxt/eslint"],
  ssr: false,

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: "ru" },
      title: "Заметки",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Заметки со списками задач" },
      ],
    },
  },

  css: ["~/assets/scss/main.scss"],

  compatibilityDate: "2026-08-23",

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/assets/scss/_variables.scss" as *;\n@use "~/assets/scss/_mixins.scss" as *;\n`,
        },
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // Отключила намеренно. Юзаю отдельно в скрипте typecheck
  },

  eslint: {
    config: {
      stylistic: {
        quotes: "double",
        semi: false,
      },
    },
  },
})
