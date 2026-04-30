<template>
  <div class="flex items-center gap-1">
    <!-- Left arrow -->
    <button
      type="button"
      class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-neutral-500 dark:hover:text-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none flex-shrink-0"
      @click="shift(-1)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <!-- 5 month pills -->
    <div class="flex gap-1">
      <button
        v-for="item in visibleMonths"
        :key="item.key"
        type="button"
        :class="[
          'flex flex-col items-center justify-center rounded-full transition-all duration-150 focus:outline-none px-2 min-w-[44px]',
          item.isCenter
            ? 'bg-[#EA021A] text-white shadow-sm py-1.5'
            : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700 py-1',
        ]"
        @click="centerOffset += item.delta"
      >
        <span class="text-[11px] font-bold leading-none capitalize">{{ item.abbr }}</span>
        <span
          v-if="item.year !== currentYear"
          class="text-[9px] leading-none mt-0.5"
          :class="item.isCenter ? 'text-white/70' : 'text-gray-400 dark:text-neutral-600'"
        >
          {{ item.year }}
        </span>
      </button>
    </div>

    <!-- Right arrow -->
    <button
      type="button"
      class="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-neutral-500 dark:hover:text-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none flex-shrink-0"
      @click="shift(1)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  modelValue: { month: number; year: number };
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: { month: number; year: number }): void;
}>();

const { locale } = useI18n();

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

// Offset in months from "now". 0 = current month, +1 = next month, -1 = last month.
const centerOffset = ref(0);

function offsetToDate(offset: number): { month: number; year: number } {
  const d = new Date(currentYear, currentMonth - 1 + offset, 1);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

function monthAbbr(month: number, year: number): string {
  const loc = locale.value === 'el' ? 'el-GR' : 'en-US';
  return new Intl.DateTimeFormat(loc, { month: 'short' }).format(new Date(year, month - 1, 1));
}

const visibleMonths = computed(() =>
  ([-2, -1, 0, 1, 2] as const).map((delta) => {
    const { month, year } = offsetToDate(centerOffset.value + delta);
    return {
      month,
      year,
      abbr: monthAbbr(month, year),
      delta,
      isCenter: delta === 0,
      key: `${year}-${month}`,
    };
  }),
);

// Initialise from modelValue on mount
const initOffset = () => {
  const diff = (props.modelValue.year - currentYear) * 12 + (props.modelValue.month - currentMonth);
  if (diff !== centerOffset.value) centerOffset.value = diff;
};
initOffset();

// Emit whenever the selected month changes
watch(centerOffset, (offset) => {
  emit('update:modelValue', offsetToDate(offset));
});

const shift = (dir: -1 | 1) => {
  centerOffset.value += dir;
};
</script>
