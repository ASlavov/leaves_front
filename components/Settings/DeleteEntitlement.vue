<template>
  <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeModal"
  >
    <div class="bg-white dark:bg-neutral-800 dark:text-white p-6 rounded-lg w-full max-w-md relative shadow-xl border dark:border-neutral-700">
      <button @click="closeModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">
        <svg class="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <h2 class="text-xl font-bold mb-4 text-red-600 dark:text-red-500">{{ $t('settings.deleteEntitlement') }}</h2>
      
      <div class="mb-6">
        <p class="text-sm font-semibold mb-2">{{ $t('settings.deleteEntitlementConfirm') }}</p>
        <p class="text-xs text-gray-500 dark:text-neutral-400 italic">"{{ $t('common.irreversibleAction') }}"</p>
      </div>

      <!-- Entitlement Details -->
      <div class="space-y-4 text-sm border-t border-b py-4 dark:border-neutral-700">
        <div class="flex justify-between">
          <span class="font-bold uppercase text-xs text-gray-400">{{ $t('common.employee') }}</span>
          <span class="font-medium">{{ entitlement.user_name || $t('common.unknown') }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-bold uppercase text-xs text-gray-400">{{ $t('settings.leaveType') }}</span>
          <span class="font-medium">{{ entitlement.leave_type_name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-bold uppercase text-xs text-gray-400">{{ $t('settings.entitledDays') }}</span>
          <span class="font-bold text-lg text-blue-600 dark:text-blue-400">{{ entitlement.entitled_days }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-bold uppercase text-xs text-gray-400">{{ $t('common.startDate') }}</span>
          <span>{{ entitlement.start_date }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-bold uppercase text-xs text-gray-400">{{ $t('common.endDate') }}</span>
          <span>{{ entitlement.end_date }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex justify-end gap-3">
        <button
            @click="closeModal"
            class="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
            :disabled="loading"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
            @click="deleteEntitlement"
            class="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-all flex items-center gap-2"
            :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ $t('settings.deleteEntitlement') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  entitlement: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'deleted']);
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const loading = ref(false);

const closeModal = () => {
  emit('close');
};

const deleteEntitlement = async () => {
  loading.value = true;
  try {
    await leavesStore.deleteEntitlement(props.entitlement.id);
    useNuxtApp().$toast.success(t('settings.deleteEntitlementSuccess'));
    emit('deleted');
    emit('saved');
    closeModal();
  } catch (error) {
    useNuxtApp().$toast.error(t('settings.deleteEntitlementError'));
  } finally {
    loading.value = false;
  }
};
</script>