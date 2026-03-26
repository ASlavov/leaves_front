<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        :class="['bg-white dark:bg-neutral-900 rounded-[10px] w-full relative',
                 'shadow-[0px_0px_12px_0px_rgba(0,0,0,0.25)] dark:shadow-[0px_0px_12px_0px_rgba(0,0,0,0.6)]',
                 maxWidth]"
      >
        <!-- Title bar (optional) -->
        <div v-if="title" class="relative flex items-center justify-center pt-[35px] pb-4">
          <h2 class="text-[24px] font-bold text-black dark:text-white">{{ title }}</h2>
          <button
            @click="$emit('update:modelValue', false)"
            class="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <CloseIcon />
          </button>
        </div>
        <!-- Close button when no title -->
        <button
          v-else
          @click="$emit('update:modelValue', false)"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <CloseIcon />
        </button>
        <!-- Content -->
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import CloseIcon from './CloseIcon.vue';

defineProps({
  modelValue: { type: Boolean, required: true },
  title:      { type: String, default: '' },
  maxWidth:   { type: String, default: 'max-w-[675px]' },
});
defineEmits(['update:modelValue']);
</script>
