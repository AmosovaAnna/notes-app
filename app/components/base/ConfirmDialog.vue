<script setup lang="ts">
import { BUTTON_VARIANT } from "~/const/variants"

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
      <BaseButton
        :variant="BUTTON_VARIANT.SECONDARY"
        @click="respond(false)"
      >
        {{ options.cancelLabel ?? "Отмена" }}
      </BaseButton>

      <BaseButton
        :variant="options.variant ?? BUTTON_VARIANT.PRIMARY"
        @click="respond(true)"
      >
        {{ options.confirmLabel ?? "Подтвердить" }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
