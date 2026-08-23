<template>
  <div class="layout">
    <header class="layout__header">
      <NuxtLink to="/" class="layout__brand">Заметки</NuxtLink>
    </header>

    <main class="layout__main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;

  &__header {
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  &__brand {
    display: inline-block;
    max-width: $content-width;
    padding: $space-4;
    color: var(--color-text);
    font-weight: 600;
    font-size: 18px;
    text-decoration: none;

    @include focus-ring;
  }

  &__main {
    width: 100%;
    max-width: $content-width;
    margin: 0 auto;
    padding: $space-4;
    flex: 1;

    @include from($bp-md) {
      padding: $space-6 $space-4;
    }
  }
}
</style>
