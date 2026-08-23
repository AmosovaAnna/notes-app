<script setup lang="ts">
const { isOpen, options, respond } = useConfirm()
</script>

<template>
  <BaseModal
    :open="isOpen"
    :title="options.title"
    @close="respond(false)"
  >
    <p v-if="options.message">
      {{ options.message }}
    </p>

    <template #actions>
      <BaseButton @click="respond(false)">
        {{ options.cancelLabel ?? "Отмена" }}
      </BaseButton>

      <BaseButton
        :variant="options.tone === 'danger' ? 'danger' : 'primary'"
        @click="respond(true)"
      >
        {{ options.confirmLabel ?? "Подтвердить" }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
