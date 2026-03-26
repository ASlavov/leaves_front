<template>
  <div :class="asModal ? '' : 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100'">
    <div class="flex-1">
      <template v-if="loading">
        <div class="px-[30px] py-[30px] flex flex-wrap gap-[15px]">
          <div v-for="i in 4" :key="i" class="w-[300px]">
            <div class="h-[14px] bg-gray-200 dark:bg-neutral-700 rounded w-1/3 mb-[8px] animate-pulse"></div>
            <div class="h-[40px] bg-gray-200 dark:bg-neutral-700 rounded-[8px] animate-pulse"></div>
          </div>
        </div>
      </template>
      <template v-else>
        <div :class="asModal ? 'px-[30px] pb-[30px] pt-[10px]' : 'grid grid-cols-12 pt-[10px] max-w-[947px]'">
          <div :class="asModal ? 'flex flex-wrap gap-[15px]' : 'grid grid-cols-2 col-span-12 gap-y-[15px] gap-x-[25px]'">

            <!-- Employees (add mode only) -->
            <div v-if="!entitlementId" :class="asModal ? 'w-full' : 'max-w-[97%] col-span-2'">
              <label :class="labelClass">{{ $t('settings.employees') }} <span class="text-[#EA021A]">*</span></label>
              <CustomMultiSelect
                v-model="formUserIds"
                :options="users"
                :placeholder="$t('settings.selectEmployees')"
              />
            </div>

            <!-- Leave Type -->
            <div :class="asModal ? 'w-[300px]' : 'max-w-sm'">
              <CustomSelect
                v-model="formLeaveTypeId"
                :options="leaveTypes"
                :label="$t('settings.leaveType') + ' <span class=\'text-[#EA021A]\'>*</span>'"
                :placeholder="$t('settings.selectLeaveType')"
                selectId="leave-type-select"
              />
            </div>

            <!-- Entitled Days -->
            <div :class="asModal ? 'w-[300px]' : 'max-w-sm'">
              <label :class="labelClass">
                {{ $t('settings.entitledDays') }} <span class="text-[#EA021A]">*</span>
                <span class="inline-block ml-1 align-middle cursor-pointer relative group">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <div class="absolute z-10 top-0 left-1/2 -translate-y-full -translate-x-1/2 w-48 p-4 bg-black text-white text-xs rounded-lg shadow-lg opacity-0 border-[1px] border-gray-700 dark:border-gray-500 group-hover:opacity-100 transition-opacity pointer-events-none dark:bg-neutral-800">
                    {{ $t('settings.entitledDaysTooltip') }}
                  </div>
                </span>
              </label>
              <input v-model.number="formEntitledDays" type="number" :class="inputClass" :placeholder="$t('settings.numberOfDays')">
            </div>

            <!-- Start Date -->
            <div :class="asModal ? 'w-[300px]' : 'max-w-sm'">
              <label :class="labelClass">{{ $t('settings.startDate') }} <span class="text-[#EA021A]">*</span></label>
              <input
                type="text"
                ref="datePickerStart"
                v-model="formStartDate"
                :class="inputClass + ' cursor-pointer'"
                :placeholder="$t('common.selectDate')"
              >
            </div>

            <!-- End Date -->
            <div :class="asModal ? 'w-[300px]' : 'max-w-sm'">
              <label :class="labelClass">{{ $t('settings.endDate') }} <span class="text-[#EA021A]">*</span></label>
              <input
                type="text"
                ref="datePickerEnd"
                v-model="formEndDate"
                :class="inputClass + ' cursor-pointer'"
                :placeholder="$t('common.selectDate')"
              >
            </div>

            <!-- Rollover toggle (add mode only) -->
            <div v-if="!entitlementId" :class="asModal ? 'w-full' : 'col-span-2'">
              <div class="flex items-center gap-[10px]">
                <button
                  type="button"
                  @click="rolloverPrevious = !rolloverPrevious"
                  :class="[
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    rolloverPrevious ? 'bg-[#EA021A]' : 'bg-gray-200 dark:bg-neutral-600'
                  ]"
                >
                  <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out', rolloverPrevious ? 'translate-x-4' : 'translate-x-0']" />
                </button>
                <span class="text-[14px] font-bold text-black dark:text-gray-100 cursor-pointer select-none" @click="rolloverPrevious = !rolloverPrevious">
                  {{ $t('settings.rolloverPreviousYear') }}
                </span>
              </div>

              <div v-if="rolloverPrevious" class="mt-[12px]">
                <label :class="labelClass">{{ $t('settings.rolloverUntil') }} <span class="text-[#EA021A]">*</span></label>
                <input
                  type="text"
                  ref="datePickerRollover"
                  v-model="rolloverUntil"
                  :class="inputClass + ' cursor-pointer w-[300px]'"
                  :placeholder="$t('common.selectDate')"
                >
              </div>
            </div>

            <!-- Submit -->
            <div :class="asModal ? 'w-full pt-[15px]' : 'info-actions pt-10 pb-5 flex gap-4 col-span-2'">
              <button @click="submitForm" :class="submitBtnClass">
                {{ entitlementId ? $t('settings.saveChanges') : $t('settings.addLeave') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useFormStyles } from '@/composables/useFormStyles';

const { t } = useI18n();
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const entitlementStore = centralStore.entitlementStore;
const leavesStore = centralStore.leavesStore;
const { $toast } = useNuxtApp();
const emit = defineEmits(['saved']);

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

const props = defineProps({
  entitlementId: {
    type: [Number, String, null],
    required: false,
  },
  asModal: {
    type: Boolean,
    default: false,
  },
});

const formUserIds = ref([]);
const formLeaveTypeId = ref(null);
const formEntitledDays = ref(0);
const formStartDate = ref('');
const formEndDate = ref('');
const loading = ref(false);

const rolloverPrevious = ref(false);
const rolloverUntil = ref('');

const datePickerStart = ref(null);
const datePickerEnd = ref(null);
const datePickerRollover = ref(null);

const users = computed(() => userStore.allUsers.map(user => ({
  id: user.id,
  name: user.name,
  icon: user.profile?.profile_image_base64
    ? `<img src="${user.profile.profile_image_base64}" class="rounded-full size-6 object-cover" />`
    : `<div class="bg-gray-300 rounded-full size-6 flex items-center justify-center text-white font-bold">${user.name.charAt(0)}</div>`,
  description: user.profile?.job_title,
})));

const leaveTypes = computed(() => leavesStore.leavesData.leavesTypes
  .filter(type => !type.deleted_at)
  .map(type => ({ id: type.id, name: type.name }))
);

onMounted(async () => {
  loading.value = true;

  if (typeof window !== 'undefined') {
    const today = new Date();
    const thisYear = new Date('' + today.getFullYear());

    flatpickr(datePickerStart.value, {
      dateFormat: "Y-m-d",
      minDate: thisYear,
      default: today,
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          const insideStartDate = new Date(selectedDates[0]);
          formStartDate.value = insideStartDate.value;
          const minEndDate = new Date(insideStartDate);
          minEndDate.setDate(minEndDate.getDate());
          flatpickr(datePickerEnd.value, {
            dateFormat: "Y-m-d",
            defaultDate: minEndDate,
            minDate: minEndDate,
          });
        }
      },
    });

    flatpickr(datePickerEnd.value, {
      dateFormat: "Y-m-d",
      minDate: thisYear,
    });
  }

  if (props.entitlementId) {
    const allEntitlements = Object.values(entitlementStore.entitledDaysData.savedUsers).flatMap(Object.values).flat();
    const entitlementToEdit = allEntitlements.find(e => e.id == props.entitlementId);
    if (entitlementToEdit) {
      formUserIds.value = [entitlementToEdit.user_id];
      formLeaveTypeId.value = entitlementToEdit.leave_type_id;
      formEntitledDays.value = entitlementToEdit.entitled_days;
      formStartDate.value = entitlementToEdit.start_from;
      formEndDate.value = entitlementToEdit.end_to;
    }
  }
  loading.value = false;
});

// Initialise the rollover date picker when the toggle is turned on
watch(rolloverPrevious, async (val) => {
  if (!val) {
    rolloverUntil.value = '';
    return;
  }
  await nextTick();
  if (typeof window !== 'undefined' && datePickerRollover.value) {
    const year = formStartDate.value
      ? new Date(formStartDate.value).getFullYear()
      : new Date().getFullYear();
    const defaultDate = `${year}-03-31`;
    flatpickr(datePickerRollover.value, {
      dateFormat: "Y-m-d",
      defaultDate,
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          rolloverUntil.value = selectedDates[0].toISOString().split('T')[0];
        }
      },
    });
    rolloverUntil.value = defaultDate;
  }
});

const submitForm = async () => {
  if (!formUserIds.value.length || !formLeaveTypeId.value || (!formEntitledDays.value && formEntitledDays.value !== 0) || !formStartDate.value || !formEndDate.value) {
    $toast.error(t('settings.fillAllFields'), { position: "bottom-right", autoClose: 5000 });
    return;
  }

  if (rolloverPrevious.value && !rolloverUntil.value) {
    $toast.error(t('settings.rolloverUntilRequired'), { position: "bottom-right", autoClose: 5000 });
    return;
  }

  try {
    if (props.entitlementId) {
      await entitlementStore.updateEntitledDaysForUser(
        props.entitlementId,
        formUserIds.value[0],
        parseInt(formLeaveTypeId.value),
        formEntitledDays.value,
        formStartDate.value,
        formEndDate.value
      );
      $toast.success(t('settings.leaveUpdated'), { position: "bottom-right", autoClose: 5000 });
      emit('saved');
    } else {
      await entitlementStore.addEntitledDays(
        formUserIds.value,
        parseInt(formLeaveTypeId.value),
        formEntitledDays.value,
        formStartDate.value,
        formEndDate.value,
        rolloverPrevious.value,
        rolloverUntil.value
      );
      $toast.success(t('settings.leaveAdded'), { position: "bottom-right", autoClose: 5000 });
      emit('saved');
    }
  } catch (error) {
    $toast.error(t('settings.saveLeaveError'), { position: "bottom-right", autoClose: 5000 });
  }
};
</script>
