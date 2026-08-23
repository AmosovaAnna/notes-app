// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  modules: ['@pinia/nuxt', '@nuxt/eslint'],

  css: ['~/assets/scss/main.scss'],

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Заметки',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Заметки со списками задач' },
      ],
    },
  },

  compatibilityDate: '2026-08-23',

  devtools: { enabled: true },

  typescript: {
    strict: true,
    typeCheck: false, // Отключила намеренно, чтоб не замедлять сборку. Юзаю отдельно в скрипте typecheck
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/assets/scss/_variables.scss" as *;\n@use "~/assets/scss/_mixins.scss" as *;\n`,
        },
      },
    },
  },
})
