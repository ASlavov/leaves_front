<template>
  <SharedBaseModal v-model="isOpen">
    <div class="p-6 bg-white dark:bg-neutral-800 rounded-lg max-w-lg w-full">
      <h3 class="text-lg font-bold mb-4 text-red-600">{{ $t('settings.terminateTitle') }}</h3>

      <div v-if="step === 1" class="space-y-4">
        <p class="text-gray-700 dark:text-gray-200">
          {{ $t('settings.terminateDesc') }}
        </p>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-200">{{
            $t('settings.terminationDate')
          }}</label>
          <SharedFlatpickrInput v-model="terminationDate" :min-date="'today'" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button
            class="px-4 py-2 text-gray-600 hover:underline dark:text-gray-300"
            @click="isOpen = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            :disabled="loading || !terminationDate"
            class="px-4 py-2 bg-gray-800 text-white rounded dark:bg-gray-600 hover:bg-gray-900 disabled:opacity-50"
            @click="previewTermination"
          >
            {{ $t('settings.previewImpact') }}
          </button>
        </div>
      </div>

      <div v-else-if="step === 2 && previewData" class="space-y-4">
        <h4
          class="font-bold border-b pb-2 dark:text-gray-100 border-gray-200 dark:border-neutral-700"
        >
          {{ $t('settings.terminateReviewTitle') }}
        </h4>
        <div class="text-sm space-y-2 dark:text-gray-200">
          <p>
            <strong>{{ $t('common.employee') }}:</strong> {{ previewData.user_name }}
          </p>
          <p>
            <strong>{{ $t('settings.terminationDate') }}:</strong>
            {{ previewData.termination_date }}
          </p>
          <p>
            <strong>{{ $t('settings.daysWorkedThisYear') }}:</strong>
            {{ previewData.worked_days_in_year }}
          </p>
          <div>
            <strong>{{ $t('settings.proratedEntitlements') }}:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li v-for="ent in previewData.prorated_entitlements" :key="ent.leave_type_name">
                {{ ent.leave_type_name }}: {{ ent.new_total_days }} ({{ $t('settings.daysUsed') }}:
                {{ ent.consumed_days }})
                <span v-if="ent.consumed_days > ent.new_total_days" class="text-red-500 ml-1"
                  >- {{ $t('settings.exceedsProratedBalance') }}</span
                >
              </li>
            </ul>
          </div>
          <div
            v-if="
              previewData.upcoming_leaves_to_cancel !== undefined &&
              previewData.upcoming_leaves_to_cancel > 0
            "
          >
            <strong>{{ $t('settings.upcomingLeavesToCancel') }}:</strong>
            {{ previewData.upcoming_leaves_to_cancel }}
          </div>
        </div>
        <div
          class="bg-red-50 p-3 rounded border border-red-200 mt-4 dark:bg-red-900/30 dark:border-red-900"
        >
          <label class="flex items-start gap-2 cursor-pointer">
            <input v-model="confirmCheckbox" type="checkbox" class="mt-1" />
            <span class="text-sm text-red-800 dark:text-red-200 font-medium">{{
              $t('settings.terminateConfirmLabel')
            }}</span>
          </label>
        </div>
        <div class="flex justify-between mt-4">
          <button
            class="px-4 py-2 text-gray-600 hover:underline dark:text-gray-300"
            @click="step = 1"
          >
            {{ $t('common.back') }}
          </button>
          <button
            :disabled="loading || !confirmCheckbox"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            @click="confirmTermination"
          >
            {{ $t('settings.terminateConfirmBtn') }}
          </button>
        </div>
      </div>
    </div>
  </SharedBaseModal>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAdminStore } from '~/stores/admin';
import type { TerminationPreviewResponse } from '~/types';

const { t } = useI18n();

const props = defineProps({
  modelValue: Boolean,
  userId: { type: [String, Number], required: true },
});
const emit = defineEmits(['update:modelValue', 'terminated']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const adminStore = useAdminStore();
const loading = computed(() => adminStore.loading);

const step = ref(1);
const terminationDate = ref('');
const previewData = ref<TerminationPreviewResponse | null>(null);
const confirmCheckbox = ref(false);

const previewTermination = async () => {
  if (!terminationDate.value) return;
  try {
    const data = await adminStore.previewTermination(props.userId, terminationDate.value);
    previewData.value = data;
    step.value = 2;
    confirmCheckbox.value = false;
  } catch (err) {
    useNuxtApp().$toast.error(t('errors.user.terminatePreviewFailed'));
  }
};

const confirmTermination = async () => {
  try {
    await adminStore.terminateUser(props.userId, terminationDate.value);
    useNuxtApp().$toast.success(t('settings.terminateSuccess'));
    isOpen.value = false;
    emit('terminated');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (err) {
    useNuxtApp().$toast.error(t('errors.user.terminateFailed'));
  }
};
</script>
