<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">
    <p class="text-[13px] text-[#808080] dark:text-neutral-400 mb-[20px]">
      {{ $t('settings.workWeekDesc') }}
    </p>

    <div class="flex flex-wrap gap-[10px] mb-[30px]">
      <button
        v-for="day in allDays"
        :key="day.value"
        type="button"
        :class="[
          'px-[16px] py-[10px] rounded-[8px] border text-[14px] font-medium transition-colors focus:outline-none select-none',
          selectedDays.includes(day.value)
            ? 'bg-[#EA021A] border-[#EA021A] text-white'
            : 'bg-white dark:bg-neutral-800 border-[#DFEAF2] dark:border-neutral-600 text-gray-700 dark:text-neutral-300',
          canModify
            ? 'hover:border-[#EA021A] hover:text-[#EA021A] cursor-pointer'
            : 'cursor-default opacity-75',
        ]"
        @click="canModify && toggleDay(day.value)"
      >
        {{ day.label }}
      </button>
    </div>

    <div
      v-if="selectedDays.length === 0"
      class="mb-[16px] text-[13px] text-amber-600 dark:text-amber-400"
    >
      {{ $t('settings.workWeekEmpty') }}
    </div>

    <button
      v-if="canModify"
      :disabled="loading || selectedDays.length === 0"
      :class="submitBtnClass"
      @click="save"
    >
      <svg v-if="loading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
          fill="none"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {{ $t('common.saveChanges') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { useFormStyles } from '@/composables/useFormStyles';
import { extractApiError } from '@/utils/extractApiError';
import { useWorkWeek } from '@/composables/settingsApiComposable';

const { t } = useI18n();
const { $toast } = useNuxtApp() as any;
const centralStore = useCentralStore();
const { workWeekStore, permissionsStore } = centralStore;
const { submitBtn: submitBtnClass } = useFormStyles();

const canModify = computed(() => permissionsStore.can('work_week', 'modify'));

// Use reactive fetching
const { data: remoteWorkWeek, pending: _workWeekPending, refresh: refreshWorkWeek } = useWorkWeek();

const loading = ref(false);

const allDays = computed(() => [
  { value: 1, label: t('settings.days.monday') },
  { value: 2, label: t('settings.days.tuesday') },
  { value: 3, label: t('settings.days.wednesday') },
  { value: 4, label: t('settings.days.thursday') },
  { value: 5, label: t('settings.days.friday') },
  { value: 6, label: t('settings.days.saturday') },
  { value: 0, label: t('settings.days.sunday') },
]);

const selectedDays = ref<number[]>([...workWeekStore.days]);

// Sync remote data to store and local state
watch(
  remoteWorkWeek,
  (newVal) => {
    if (newVal) {
      workWeekStore.days = newVal.days;
      selectedDays.value = [...newVal.days];
    }
  },
  { immediate: true },
);

const toggleDay = (day: number) => {
  const idx = selectedDays.value.indexOf(day);
  if (idx === -1) {
    selectedDays.value.push(day);
    selectedDays.value.sort((a, b) => a - b);
  } else {
    selectedDays.value.splice(idx, 1);
  }
};

const save = async () => {
  if (selectedDays.value.length === 0) return;
  loading.value = true;
  try {
    await workWeekStore.updateWorkWeek([...selectedDays.value]);
    await refreshWorkWeek();
    $toast.success(t('settings.workWeekSaved'));
  } catch (error) {
    const { type, message } = extractApiError(error);
    $toast.error(type === 'user' && message ? message : t('settings.workWeekSaveError'));
  } finally {
    loading.value = false;
  }
};
</script>
