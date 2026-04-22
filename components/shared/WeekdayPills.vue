<template>
  <div class="flex flex-wrap gap-[8px]">
    <button
      v-for="day in days"
      :key="day.value"
      type="button"
      :disabled="disabled"
      :class="[
        'h-[36px] min-w-[44px] px-[12px] rounded-full text-[13px] font-bold transition-colors focus:outline-none',
        isActive(day.value)
          ? 'bg-[#EA021A] text-white border border-[#EA021A]'
          : 'bg-white text-gray-600 border border-[#DFEAF2] hover:border-gray-400 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:border-neutral-400',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @click="toggle(day.value)"
    >
      {{ day.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: { type: Array as PropType<number[]>, default: () => [] },
  disabled: { type: Boolean, default: false },
  // Start-of-week index (0=Sun). Only changes visual order, not values.
  startOfWeek: { type: Number as PropType<number>, default: 1 },
});

const emit = defineEmits<{ (e: 'update:modelValue', value: number[]): void }>();

const dayLabels = computed(() => [
  { value: 0, label: t('settings.days.sunday') },
  { value: 1, label: t('settings.days.monday') },
  { value: 2, label: t('settings.days.tuesday') },
  { value: 3, label: t('settings.days.wednesday') },
  { value: 4, label: t('settings.days.thursday') },
  { value: 5, label: t('settings.days.friday') },
  { value: 6, label: t('settings.days.saturday') },
]);

const days = computed(() => {
  const offset = ((props.startOfWeek % 7) + 7) % 7;
  return [...dayLabels.value.slice(offset), ...dayLabels.value.slice(0, offset)];
});

const isActive = (v: number) => props.modelValue.includes(v);

const toggle = (v: number) => {
  if (props.disabled) return;
  const set = new Set(props.modelValue);
  if (set.has(v)) set.delete(v);
  else set.add(v);
  emit(
    'update:modelValue',
    [...set].sort((a, b) => a - b),
  );
};
</script>
