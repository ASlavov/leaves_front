<template>
  <div class="p-4 bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 shadow-sm max-w-2xl mx-auto mt-8">
    <h2 class="text-xl font-bold mb-6 dark:text-gray-100 border-b pb-2 dark:border-neutral-700">{{ $t('settings.editLeaveType') }}</h2>
    
    <div class="space-y-6">
      <!-- Leave Type Name -->
      <div class="flex flex-col space-y-2">
        <label class="text-sm font-bold uppercase text-gray-400 dark:text-neutral-500">{{ $t('settings.leaveTypeName') }}</label>
        <div class="relative group">
          <input
              v-model="leaveTypeData.name"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100 dark:focus:ring-blue-600"
              :placeholder="$t('settings.leaveTypePlaceholder')"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 pt-4">
        <button
            @click="$emit('cancel')"
            class="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
            @click="saveLeaveType"
            class="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all flex items-center gap-2"
            :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ $t('common.saveChanges') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps({
  leaveTypeId: {
    type: [Number, String],
    required: true,
  },
});

const emit = defineEmits(['cancel', 'saved']);
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const loading = ref(false);

const leaveTypeData = ref({
  name: '',
});

onMounted(async () => {
    // Find name from store if data is loaded
    if (leavesStore.leavesData?.leavesTypes) {
        const type = leavesStore.leavesData.leavesTypes.find(t => String(t.id) === String(props.leaveTypeId));
        if (type) {
            leaveTypeData.value.name = type.name;
        }
    }
});

const saveLeaveType = async () => {
    if (!leaveTypeData.value.name) return;
    
    loading.value = true;
    try {
        await leavesStore.updateLeaveType(props.leaveTypeId, leaveTypeData.value.name);
        useNuxtApp().$toast.success(t('settings.leaveUpdated'));
        emit('saved');
    } catch (error) {
        useNuxtApp().$toast.error(t('settings.saveLeaveError'));
    } finally {
        loading.value = false;
    }
}
</script>