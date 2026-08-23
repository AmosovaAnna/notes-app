<script setup lang="ts">
import { ROUTES } from "~/const/routes"
</script>

<template>
  <div class="layout">
    <header class="layout__header">
      <NuxtLink
        :to="ROUTES.NOTES"
        class="layout__brand"
      >
        Заметки
      </NuxtLink>
    </header>

    <main class="layout__main">
      <slot></slot>
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
    margin: $space-2;
    padding: $space-2;
    color: var(--color-text);
    border-radius: $radius-md;
    font-weight: 600;
    font-size: 18px;
    transition: outline-color $transition-fast;
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
