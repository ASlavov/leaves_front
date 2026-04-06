<template>
  <SharedBaseModal v-model="isOpen">
    <div class="p-6 bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full">
      <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
        {{ $t('leaves.admin.recordTitle') }}
      </h3>
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-200"
            >{{ $t('common.employee') }} <span class="text-red-500">*</span></label
          >
          <MiscCustomSelect
            v-model="payload.userId"
            :options="userOptions"
            :label="$t('leaves.admin.selectEmployee')"
            :placeholder="$t('leaves.admin.selectEmployee')"
            select-id="admin-user-select"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-200">{{
            $t('settings.leaveType')
          }}</label>
          <MiscCustomSelect
            v-model="payload.leaveTypeId"
            :options="leaveTypeOptions"
            :label="$t('settings.selectLeaveType')"
            :placeholder="$t('settings.selectLeaveType')"
            select-id="admin-leave-select"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-200"
            >{{ $t('leaves.admin.dateRange') }} <span class="text-red-500">*</span></label
          >
          <div class="flex gap-2">
            <input
              v-model="payload.startDate"
              type="date"
              class="border p-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              required
            />
            <input
              v-model="payload.endDate"
              type="date"
              class="border p-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              required
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 dark:text-gray-200"
            >{{ $t('leaves.admin.reasonNotes') }} <span class="text-red-500">*</span></label
          >
          <textarea
            v-model="payload.administrativeReason"
            class="border p-2 rounded w-full dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
            required
          ></textarea>
        </div>
        <div class="flex justify-end gap-2 mt-2">
          <button
            type="button"
            class="px-4 py-2 text-gray-600 hover:underline dark:text-gray-300"
            @click="isOpen = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ $t('leaves.admin.submitBtn') }}
          </button>
        </div>
      </form>
    </div>
  </SharedBaseModal>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '~/stores/centralStore';
import { useAdminStore } from '~/stores/admin';
import type { AdminLeavePayload } from '~/types';

const { t } = useI18n();

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'saved']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const centralStore = useCentralStore();
const adminStore = useAdminStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;

const loading = computed(() => adminStore.loading);

const payload = ref<AdminLeavePayload>({
  userId: '',
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  administrativeReason: '',
});

const userOptions = computed(() => {
  return (userStore.allUsers || []).map((u: any) => ({ id: u.id, name: u.name }));
});

const leaveTypeOptions = computed(() => {
  return (leavesStore.leavesData?.leavesTypes || []).map((t: any) => ({ id: t.id, name: t.name }));
});

const submitForm = async () => {
  if (
    !payload.value.userId ||
    !payload.value.startDate ||
    !payload.value.endDate ||
    !payload.value.administrativeReason
  )
    return;
  try {
    await adminStore.recordAdministrativeLeave(payload.value);
    useNuxtApp().$toast.success(t('leaves.admin.saveSuccess'));
    emit('saved');
    isOpen.value = false;
  } catch (error) {
    useNuxtApp().$toast.error(t('errors.leaves.adminSaveFailed'));
  }
};
</script>
