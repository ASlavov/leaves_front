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

      <!-- Advanced Rules Toggle -->
      <div class="w-full mt-2">
        <button
          type="button"
          class="text-[#EA021A] hover:underline text-sm font-medium flex items-center gap-1"
          @click="showAdvancedRules = !showAdvancedRules"
        >
          {{
            showAdvancedRules ? $t('settings.hideAdvancedRules') : $t('settings.showAdvancedRules')
          }}
        </button>
      </div>

      <!-- Advanced Rules Section -->
      <div
        v-show="showAdvancedRules"
        class="w-full bg-gray-50 dark:bg-neutral-800 border dark:border-neutral-700 p-4 rounded space-y-5"
      >
        <!-- Priority & Overflow -->
        <h4 class="font-bold text-[14px] text-gray-800 dark:text-gray-200">
          {{ $t('settings.priorityOverflow') }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
          <div>
            <label :class="labelClass">{{ $t('settings.priorityLevel') }}</label>
            <input
              v-model.number="leaveTypeData.priorityLevel"
              type="number"
              min="1"
              max="100"
              :class="inputClass"
            />
            <p class="text-[12px] text-gray-500 mt-[6px]">{{ $t('settings.priorityNote') }}</p>
          </div>
          <div>
            <label :class="labelClass">{{ $t('settings.allowWalletOverflow') }}</label>
            <div class="flex items-center gap-2 mt-[6px]">
              <input v-model="leaveTypeData.allowWalletOverflow" type="checkbox" class="h-4 w-4" />
              <span class="text-[14px] text-gray-700 dark:text-gray-300">{{
                $t('settings.allowWalletOverflowNote')
              }}</span>
            </div>
          </div>
          <div v-if="leaveTypeData.allowWalletOverflow" class="sm:col-span-2">
            <CustomSelect
              v-model="leaveTypeData.overflowLeaveTypeId"
              :options="dependsOnOptions"
              :label="$t('settings.overflowLeaveType')"
              :placeholder="$t('settings.selectOverflowType')"
              select-id="overflow-type-select"
            />
            <p class="text-[12px] text-gray-500 mt-[6px]">{{ $t('settings.overflowNote') }}</p>
          </div>
        </div>

        <hr class="border-gray-200 dark:border-neutral-700" />

        <!-- Accrual -->
        <h4 class="font-bold text-[14px] text-gray-800 dark:text-gray-200">
          {{ $t('settings.accrual') }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
          <div>
            <label :class="labelClass">{{ $t('settings.accrualType') }}</label>
            <div class="flex items-center gap-4 mt-[6px]">
              <label class="text-[14px] text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <input v-model="leaveTypeData.accrualType" type="radio" value="upfront" />
                {{ $t('settings.upfront') }}
              </label>
              <label class="text-[14px] text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <input v-model="leaveTypeData.accrualType" type="radio" value="pro_rata_monthly" />
                {{ $t('settings.monthlyProRata') }}
              </label>
            </div>
            <p class="text-[12px] text-gray-500 mt-[6px]">{{ $t('settings.accrualNote') }}</p>
          </div>
          <div>
            <label :class="labelClass">{{ $t('settings.allowNegativeBalance') }}</label>
            <div class="flex items-center gap-2 mt-[6px]">
              <input v-model="leaveTypeData.allowNegativeBalance" type="checkbox" class="h-4 w-4" />
            </div>
          </div>
          <div v-if="leaveTypeData.allowNegativeBalance">
            <label :class="labelClass">{{ $t('settings.maxNegativeBalance') }}</label>
            <input
              v-model.number="leaveTypeData.maxNegativeBalance"
              type="number"
              min="0"
              :class="inputClass"
            />
          </div>
          <div>
            <label :class="labelClass">{{ $t('settings.autoApproveRequests') }}</label>
            <div class="flex items-center gap-2 mt-[6px]">
              <input v-model="leaveTypeData.autoApprove" type="checkbox" class="h-4 w-4" />
              <span class="text-[14px] text-gray-700 dark:text-gray-300">{{
                $t('settings.autoApproveNote')
              }}</span>
            </div>
          </div>
        </div>

        <hr class="border-gray-200 dark:border-neutral-700" />

        <!-- Schedule & Document -->
        <h4 class="font-bold text-[14px] text-gray-800 dark:text-gray-200">
          {{ $t('settings.scheduleDocument') }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
          <div>
            <label :class="labelClass">{{ $t('settings.isHourly') }}</label>
            <div class="flex items-center gap-2 mt-[6px]">
              <input v-model="leaveTypeData.isHourly" type="checkbox" class="h-4 w-4" />
              <span class="text-[14px] text-gray-700 dark:text-gray-300">{{
                $t('settings.isHourlyNote')
              }}</span>
            </div>
          </div>
          <div v-if="leaveTypeData.isHourly">
            <label :class="labelClass">{{ $t('settings.hoursPerDay') }}</label>
            <input
              v-model.number="leaveTypeData.hoursPerDay"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              :class="inputClass"
            />
          </div>
          <div>
            <label :class="labelClass">{{ $t('settings.attachmentRequiredAfter') }}</label>
            <input
              v-model.number="leaveTypeData.attachmentRequiredAfterDays"
              type="number"
              min="1"
              :class="inputClass"
            />
            <p class="text-[12px] text-gray-500 mt-[6px]">{{ $t('settings.attachmentNote') }}</p>
          </div>
        </div>
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

const showAdvancedRules = ref(false);

interface LeaveTypeForm {
  name: string;
  dependsOnTypeId: string | number;
  allowRollover: boolean;
  priorityLevel: number;
  allowWalletOverflow: boolean;
  overflowLeaveTypeId: string | number;
  accrualType: 'upfront' | 'pro_rata_monthly';
  allowNegativeBalance: boolean;
  maxNegativeBalance: number;
  isHourly: boolean;
  hoursPerDay: number;
  attachmentRequiredAfterDays: number | '';
  autoApprove: boolean;
}

const leaveTypeData = ref<LeaveTypeForm>({
  name: '',
  dependsOnTypeId: '',
  allowRollover: true,
  priorityLevel: 10,
  allowWalletOverflow: false,
  overflowLeaveTypeId: '',
  accrualType: 'upfront',
  allowNegativeBalance: false,
  maxNegativeBalance: 0,
  isHourly: false,
  hoursPerDay: 8,
  attachmentRequiredAfterDays: '',
  autoApprove: false,
});

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
        leaveTypeData.value.priorityLevel = type.priority_level ?? 10;
        leaveTypeData.value.allowWalletOverflow = type.allow_wallet_overflow ?? false;
        leaveTypeData.value.overflowLeaveTypeId = type.overflow_leave_type_id ?? '';
        leaveTypeData.value.accrualType = type.accrual_type ?? 'upfront';
        leaveTypeData.value.allowNegativeBalance = type.allow_negative_balance ?? false;
        leaveTypeData.value.maxNegativeBalance = type.max_negative_balance ?? 0;
        leaveTypeData.value.isHourly = type.is_hourly ?? false;
        leaveTypeData.value.hoursPerDay = type.hours_per_day ?? 8;
        leaveTypeData.value.attachmentRequiredAfterDays = type.attachment_required_after_days ?? '';
        leaveTypeData.value.autoApprove = type.auto_approve ?? false;
      }
    } else {
      // Reset for new
      leaveTypeData.value = {
        name: '',
        dependsOnTypeId: '',
        allowRollover: true,
        priorityLevel: 10,
        allowWalletOverflow: false,
        overflowLeaveTypeId: '',
        accrualType: 'upfront',
        allowNegativeBalance: false,
        maxNegativeBalance: 0,
        isHourly: false,
        hoursPerDay: 8,
        attachmentRequiredAfterDays: '',
        autoApprove: false,
      };
    }
  },
  { immediate: true },
);

const saveLeaveType = async () => {
  if (!leaveTypeData.value.name) return;

  loadingState.value = true;
  try {
    const payload = {
      name: leaveTypeData.value.name,
      dependsOnTypeId: leaveTypeData.value.dependsOnTypeId || null,
      allowRollover: leaveTypeData.value.allowRollover,
      priorityLevel: leaveTypeData.value.priorityLevel,
      allowWalletOverflow: leaveTypeData.value.allowWalletOverflow,
      overflowLeaveTypeId: leaveTypeData.value.overflowLeaveTypeId || null,
      accrualType: leaveTypeData.value.accrualType,
      allowNegativeBalance: leaveTypeData.value.allowNegativeBalance,
      maxNegativeBalance: leaveTypeData.value.maxNegativeBalance,
      isHourly: leaveTypeData.value.isHourly,
      hoursPerDay: leaveTypeData.value.hoursPerDay,
      attachmentRequiredAfterDays: leaveTypeData.value.attachmentRequiredAfterDays || null,
      autoApprove: leaveTypeData.value.autoApprove,
    };

    if (props.leaveTypeId) {
      await leavesStore.updateLeaveType({
        id: props.leaveTypeId,
        ...payload,
      });
      (useNuxtApp() as unknown as { $toast: any }).$toast.success(t('settings.leaveUpdated'));
    } else {
      await leavesStore.createLeaveType(payload);
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
