<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">
    <div class="flex flex-wrap gap-[15px]">
      <!-- Leave Type Name -->
      <div class="w-full">
        <label :class="labelClass"
          >{{ $t('settings.leaveTypeName') }} <span class="text-[#EA021A]">*</span></label
        >
        <input
          v-model="leaveTypeData.name"
          type="text"
          :class="inputClass"
          :placeholder="$t('settings.leaveTypePlaceholder')"
        />
      </div>

      <!-- Depends On -->
      <div class="w-full">
        <CustomSelect
          v-model="leaveTypeData.dependsOnTypeId"
          :options="dependsOnOptions"
          :label="$t('settings.dependsOnLeaveType')"
          :placeholder="$t('settings.dependsOnLeaveTypePlaceholder')"
          select-id="depends-on-type-select"
        />
      </div>

      <!-- Allow Rollover toggle -->
      <div class="w-full">
        <div class="flex items-center gap-[10px]">
          <button
            type="button"
            :class="[
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              leaveTypeData.allowRollover ? 'bg-[#EA021A]' : 'bg-gray-200 dark:bg-neutral-600',
            ]"
            @click="leaveTypeData.allowRollover = !leaveTypeData.allowRollover"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out',
                leaveTypeData.allowRollover ? 'translate-x-4' : 'translate-x-0',
              ]"
            />
          </button>
          <span
            class="text-[14px] font-bold text-black dark:text-gray-100 cursor-pointer select-none"
            @click="leaveTypeData.allowRollover = !leaveTypeData.allowRollover"
          >
            {{ $t('settings.allowRollover') }}
          </span>
        </div>
        <p
          v-if="!leaveTypeData.allowRollover"
          class="mt-[6px] text-[12px] text-amber-600 dark:text-amber-400"
        >
          {{ $t('settings.allowRolloverOff') }}
        </p>
      </div>

      <!-- Submit -->
      <div class="w-full pt-[10px]">
        <button :class="submitBtnClass" :disabled="loading" @click="saveLeaveType">
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ $t('common.saveChanges') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import { useI18n } from 'vue-i18n';
import { useFormStyles } from '@/composables/useFormStyles';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import { extractApiError } from '@/utils/extractApiError';
import { useLeavesTypesReactive } from '@/composables/leavesApiComposable';
import type { LeaveType } from '@/types';

const { t } = useI18n();
const props = defineProps({
  leaveTypeId: {
    type: [Number, String] as PropType<number | string | undefined>,
    required: false,
    default: undefined,
  },
});

const emit = defineEmits(['cancel', 'saved']);
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;

const { data: remoteLeaves, pending: fetchingTypes } = useLeavesTypesReactive(false); // Only active for dependencies

const loadingState = ref(false);
const loading = computed(() => loadingState.value || fetchingTypes.value);

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

interface LeaveTypeForm {
  name: string;
  dependsOnTypeId: string | number;
  allowRollover: boolean;
}

const leaveTypeData = ref<LeaveTypeForm>({ name: '', dependsOnTypeId: '', allowRollover: true });

const dependsOnOptions = computed(() => {
  const types = remoteLeaves.value || leavesStore.leavesData.leavesTypes || [];
  return [
    { id: '', name: `— ${t('common.none')} —` },
    ...types
      .filter((lt: LeaveType) => !lt.deleted_at && String(lt.id) !== String(props.leaveTypeId))
      .map((lt: LeaveType) => ({ id: lt.id, name: lt.name })),
  ];
});

watch(
  () => props.leaveTypeId,
  (newId) => {
    if (newId && leavesStore.leavesData?.leavesTypes) {
      const type = leavesStore.leavesData.leavesTypes.find(
        (t: LeaveType) => String(t.id) === String(newId),
      );
      if (type) {
        leaveTypeData.value.name = type.name;
        leaveTypeData.value.dependsOnTypeId = type.depends_on_type_id ?? '';
        leaveTypeData.value.allowRollover = type.allow_rollover !== false;
      }
    } else {
      // Reset for new
      leaveTypeData.value = { name: '', dependsOnTypeId: '', allowRollover: true };
    }
  },
  { immediate: true },
);

const saveLeaveType = async () => {
  if (!leaveTypeData.value.name) return;

  loadingState.value = true;
  try {
    const dependsOnTypeId = leaveTypeData.value.dependsOnTypeId || null;
    if (props.leaveTypeId) {
      await leavesStore.updateLeaveType(
        props.leaveTypeId,
        leaveTypeData.value.name,
        dependsOnTypeId,
        leaveTypeData.value.allowRollover,
      );
      (useNuxtApp() as unknown as { $toast: any }).$toast.success(t('settings.leaveUpdated'));
    } else {
      await leavesStore.createLeaveType(
        leaveTypeData.value.name,
        dependsOnTypeId,
        leaveTypeData.value.allowRollover,
      );
      (useNuxtApp() as unknown as { $toast: any }).$toast.success(t('settings.leaveAdded'));
    }
    emit('saved');
  } catch (error) {
    const { type, message } = extractApiError(error);
    (useNuxtApp() as unknown as { $toast: any }).$toast.error(
      type === 'user' && message
        ? message
        : props.leaveTypeId
          ? t('errors.leaves.updateTypeFailed')
          : t('errors.leaves.createTypeFailed'),
    );
  } finally {
    loadingState.value = false;
  }
};
</script>
