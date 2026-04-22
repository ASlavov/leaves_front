<template>
  <input
    ref="inputRef"
    :class="inputClass"
    :placeholder="placeholder || $t('common.selectDate')"
    readonly
    :value="modelValue"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, type PropType } from 'vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import type { Instance, DateOption } from 'flatpickr/dist/types/instance';
import { useFormStyles } from '@/composables/useFormStyles';

const props = defineProps({
  modelValue: { type: String as PropType<string>, default: '' },
  placeholder: { type: String, default: '' },
  minDate: { type: [String, Date, null] as PropType<DateOption | null>, default: null },
  maxDate: { type: [String, Date, null] as PropType<DateOption | null>, default: null },
  disable: {
    type: Array as PropType<Array<((date: Date) => boolean) | string | Date>>,
    default: () => [],
  },
});

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const { input: inputClass } = useFormStyles();
const inputRef = ref<HTMLInputElement | null>(null);
let instance: Instance | null = null;

const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

onMounted(() => {
  if (!inputRef.value) return;
  instance = flatpickr(inputRef.value, {
    dateFormat: 'Y-m-d',
    defaultDate: props.modelValue || undefined,
    minDate: props.minDate || undefined,
    maxDate: props.maxDate || undefined,
    disable: props.disable,
    onChange: (dates) => {
      const v = dates[0] ? toLocalDateStr(dates[0]) : '';
      emit('update:modelValue', v);
    },
  });
});

watch(
  () => props.modelValue,
  (v) => {
    if (instance && v !== (instance.input.value || '')) {
      instance.setDate(v || '', false);
    }
  },
);

watch(
  () => [props.minDate, props.maxDate, props.disable],
  ([min, max, disable]) => {
    if (!instance) return;
    instance.set('minDate', (min as DateOption) || undefined);
    instance.set('maxDate', (max as DateOption) || undefined);
    instance.set('disable', (disable as any) || []);
  },
);

onBeforeUnmount(() => {
  instance?.destroy();
  instance = null;
});
</script>
