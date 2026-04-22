<template>
  <SharedBaseModal v-model="isOpen">
    <div class="px-[30px] pb-[30px] pt-[10px]">
      <h3 class="text-[20px] font-bold text-black dark:text-white mb-[16px]">
        {{ $t('leaves.admin.recordTitle') }}
      </h3>
      <form class="space-y-[15px]" @submit.prevent="submitForm">
        <div>
          <label :class="labelClass">
            {{ $t('common.employees') }} <span class="text-[#EA021A]">*</span>
          </label>
          <MiscCustomMultiSelect
            v-model="payload.userIds"
            :options="userOptions"
            :placeholder="$t('leaves.admin.selectEmployees')"
          />
        </div>

        <div>
          <label :class="labelClass">{{ $t('settings.leaveType') }}</label>
          <MiscCustomSelect
            v-model="payload.leaveTypeId"
            :options="leaveTypeOptions"
            :placeholder="$t('settings.selectLeaveType')"
            select-id="admin-leave-select"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
          <div>
            <label :class="labelClass">
              {{ $t('leaves.fromDate') }} <span class="text-[#EA021A]">*</span>
            </label>
            <SharedFlatpickrInput v-model="payload.startDate" />
          </div>
          <div>
            <label :class="labelClass">
              {{ $t('leaves.toHuman') }} <span class="text-[#EA021A]">*</span>
            </label>
            <SharedFlatpickrInput v-model="payload.endDate" :min-date="payload.startDate" />
          </div>
        </div>

        <div>
          <label :class="labelClass">
            {{ $t('leaves.admin.reasonNotes') }} <span class="text-[#EA021A]">*</span>
          </label>
          <textarea
            v-model="payload.administrativeReason"
            rows="3"
            class="py-[8px] px-[16px] block w-full border border-[#DFEAF2] rounded-[8px] text-[14px] bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-100"
            required
          ></textarea>
        </div>

        <div class="flex justify-end gap-[10px] pt-[8px]">
          <button
            type="button"
            class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none"
            @click="isOpen = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" :disabled="loading || !canSubmit" :class="submitBtnClass">
            {{ $t('leaves.admin.submitBtn') }}
            <span v-if="payload.userIds.length" class="ml-1 text-xs opacity-80">
              ({{ payload.userIds.length }})
            </span>
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
import { useFormStyles } from '@/composables/useFormStyles';

const { t } = useI18n();
const { $toast } = useNuxtApp() as any;
const { label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

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

const payload = ref({
  userIds: [] as (string | number)[],
  leaveTypeId: '' as string | number,
  startDate: '',
  endDate: '',
  administrativeReason: '',
});

const userOptions = computed(() =>
  (userStore.allUsers || []).map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
);

const leaveTypeOptions = computed(() =>
  (leavesStore.leavesData?.leavesTypes || []).map((lt: any) => ({ id: lt.id, name: lt.name })),
);

const canSubmit = computed(
  () =>
    payload.value.userIds.length > 0 &&
    payload.value.startDate &&
    payload.value.endDate &&
    payload.value.administrativeReason.trim(),
);

const submitForm = async () => {
  if (!canSubmit.value) return;
  const results = await Promise.allSettled(
    payload.value.userIds.map((userId) =>
      adminStore.recordAdministrativeLeave({
        userId,
        leaveTypeId: payload.value.leaveTypeId,
        startDate: payload.value.startDate,
        endDate: payload.value.endDate,
        administrativeReason: payload.value.administrativeReason,
      }),
    ),
  );
  const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - fulfilled;
  if (fulfilled) $toast.success(t('leaves.admin.saveSuccessBulk', { count: fulfilled }));
  if (failed) $toast.error(t('errors.leaves.adminSaveFailedBulk', { count: failed }));
  if (fulfilled) {
    emit('saved');
    isOpen.value = false;
    payload.value = {
      userIds: [],
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      administrativeReason: '',
    };
  }
};
</script>
