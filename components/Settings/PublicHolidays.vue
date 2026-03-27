<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">

    <!-- Toolbar: year nav + actions -->
    <div class="flex items-center gap-[12px] mb-[20px] flex-wrap">
      <div class="flex items-center gap-[8px]">
        <button @click="prevYear" class="p-[6px] rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-400 focus:outline-none">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span class="text-[15px] font-bold text-black dark:text-white w-[50px] text-center">{{ selectedYear }}</span>
        <button @click="nextYear" class="p-[6px] rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-400 focus:outline-none">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      <template v-if="canModify">
        <button @click="openAdd" :class="submitBtnClass">+ {{ $t('settings.addHoliday') }}</button>
        <button @click="openMassAdd" class="inline-flex items-center justify-center py-[15px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none">
          {{ $t('settings.massAddHolidays') }}
        </button>
        <!-- Mass delete button — appears when any row is checked -->
        <button
          v-if="selectedIds.size > 0"
          @click="confirmMassDelete"
          class="inline-flex items-center justify-center py-[15px] px-[20px] rounded-[70px] bg-red-600 text-white text-[14px] font-bold hover:bg-red-700 focus:outline-none ml-auto"
        >
          {{ $t('settings.massDeleteSelected', { count: selectedIds.size }) }}
        </button>
      </template>
    </div>

    <div v-if="loading" class="text-[14px] text-[#808080] dark:text-neutral-400">{{ $t('common.loading') }}</div>

    <div v-else-if="yearHolidays.length === 0" class="text-[14px] text-[#808080] dark:text-neutral-400 py-[8px]">
      {{ $t('settings.noHolidays') }}
    </div>

    <!-- Holiday table -->
    <div v-else class="rounded-[8px] border border-[#DFEAF2] dark:border-neutral-600 overflow-hidden">
      <!-- Header -->
      <div class="grid items-center px-[14px] py-[8px] bg-gray-50 dark:bg-neutral-800 text-[12px] font-bold text-[#808080] dark:text-neutral-400 uppercase tracking-wide" style="grid-template-columns: 32px 1fr auto auto">
        <input
          v-if="canModify"
          type="checkbox"
          class="h-4 w-4 rounded accent-[#EA021A] cursor-pointer"
          :checked="allVisibleSelected"
          :indeterminate="someSelected"
          @change="toggleSelectAll"
        />
        <span v-else />
        <span>{{ $t('settings.holidayName') }}</span>
        <span class="pr-[16px]">{{ $t('common.date') }}</span>
        <span></span>
      </div>
      <!-- Rows -->
      <div
        v-for="holiday in yearHolidays"
        :key="holiday.id"
        class="grid items-center px-[14px] py-[10px] text-[13px] border-t border-[#DFEAF2] dark:border-neutral-700 text-black dark:text-gray-100"
        style="grid-template-columns: 32px 1fr auto auto"
      >
        <input
          v-if="canModify"
          type="checkbox"
          class="h-4 w-4 rounded accent-[#EA021A] cursor-pointer"
          :checked="selectedIds.has(String(holiday.id))"
          @change="toggleSelect(String(holiday.id))"
        />
        <span v-else />
        <div class="flex items-center gap-[8px] min-w-0">
          <span class="font-medium truncate">{{ holiday.name }}</span>
          <span
            :class="[
              'shrink-0 text-[11px] font-semibold px-[7px] py-[2px] rounded-full',
              holiday.is_recurring
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            ]"
          >
            {{ holiday.is_recurring ? $t('settings.recurring') : $t('settings.oneTime') }}
          </span>
        </div>
        <span class="text-[#808080] dark:text-neutral-400 pr-[16px]">{{ formatDate(holiday.date) }}</span>
        <div class="flex items-center gap-[12px]">
          <template v-if="canModify">
            <button @click="openEdit(holiday)" class="text-blue-500 hover:text-blue-700 dark:text-blue-400 focus:outline-none text-[12px]">{{ $t('common.edit') }}</button>
            <button @click="confirmDelete(holiday)" class="text-red-500 hover:text-red-700 dark:text-red-400 focus:outline-none text-[12px]">{{ $t('common.delete') }}</button>
          </template>
        </div>
      </div>
    </div>

    <!-- ── Add / Edit Modal ───────────────────────────── -->
    <div v-if="showForm" class="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50" @click.self="closeForm">
      <div class="bg-white dark:bg-neutral-800 rounded-[12px] p-[24px] w-full max-w-[400px] shadow-xl">
        <h3 class="text-[16px] font-bold text-black dark:text-white mb-[20px]">
          {{ editingHoliday ? $t('settings.editHoliday') : $t('settings.addHoliday') }}
        </h3>
        <div class="space-y-[14px]">
          <div>
            <label :class="labelClass">{{ $t('settings.holidayName') }} <span class="text-[#EA021A]">*</span></label>
            <input v-model="form.name" type="text" :class="inputClass" :placeholder="$t('settings.holidayNamePlaceholder')" />
          </div>
          <div>
            <label :class="labelClass">{{ $t('common.date') }} <span class="text-[#EA021A]">*</span></label>
            <input v-model="form.date" type="date" :class="inputClass" />
          </div>
          <!-- Recurring toggle -->
          <div class="flex items-center gap-[10px] pt-[4px]">
            <button
              type="button"
              @click="form.isRecurring = !form.isRecurring"
              :class="['relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none', form.isRecurring ? 'bg-[#EA021A]' : 'bg-gray-200 dark:bg-neutral-600']"
            >
              <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out', form.isRecurring ? 'translate-x-4' : 'translate-x-0']" />
            </button>
            <span class="text-[13px] text-black dark:text-gray-100 cursor-pointer select-none" @click="form.isRecurring = !form.isRecurring">
              {{ $t('settings.holidayRecurring') }}
            </span>
          </div>
          <p class="text-[12px] text-[#808080] dark:text-neutral-400 -mt-[6px]">
            {{ form.isRecurring ? $t('settings.holidayRecurringDesc') : $t('settings.holidayOneTimeDesc') }}
          </p>
        </div>
        <div class="flex gap-[10px] mt-[24px]">
          <button @click="saveHoliday" :disabled="formLoading || !form.name || !form.date" :class="submitBtnClass">
            <svg v-if="formLoading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ $t('common.saveChanges') }}
          </button>
          <button @click="closeForm" class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- ── Mass Add Modal ─────────────────────────────── -->
    <div v-if="showMassAdd" class="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50" @click.self="closeMassAdd">
      <div class="bg-white dark:bg-neutral-800 rounded-[12px] p-[24px] w-full max-w-[480px] shadow-xl">
        <h3 class="text-[16px] font-bold text-black dark:text-white mb-[6px]">{{ $t('settings.massAddHolidays') }}</h3>
        <p class="text-[13px] text-[#808080] dark:text-neutral-400 mb-[20px]">{{ $t('settings.massAddDesc') }}</p>
        <div class="space-y-[14px]">
          <!-- Multi-date picker -->
          <div>
            <label :class="labelClass">{{ $t('settings.selectDates') }}</label>
            <input ref="massDatePicker" type="text" :class="inputClass" :placeholder="$t('settings.clickToSelectDates')" readonly />
            <p v-if="massSelectedDates.length > 0" class="mt-[6px] text-[12px] text-[#808080] dark:text-neutral-400">
              {{ $t('settings.datesSelected', { count: massSelectedDates.length }) }}
            </p>
          </div>
          <!-- Shared name -->
          <div>
            <label :class="labelClass">{{ $t('settings.holidayName') }} <span class="text-[12px] font-normal text-[#808080]">({{ $t('settings.leaveAllEmpty') }})</span></label>
            <input v-model="massForm.name" type="text" :class="inputClass" :placeholder="$t('settings.holidayNamePlaceholder')" />
          </div>
          <!-- Recurring toggle -->
          <div class="flex items-center gap-[10px]">
            <button
              type="button"
              @click="massForm.isRecurring = !massForm.isRecurring"
              :class="['relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none', massForm.isRecurring ? 'bg-[#EA021A]' : 'bg-gray-200 dark:bg-neutral-600']"
            >
              <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out', massForm.isRecurring ? 'translate-x-4' : 'translate-x-0']" />
            </button>
            <span class="text-[13px] text-black dark:text-gray-100 cursor-pointer select-none" @click="massForm.isRecurring = !massForm.isRecurring">
              {{ $t('settings.holidayRecurring') }}
            </span>
          </div>
          <p class="text-[12px] text-[#808080] dark:text-neutral-400 -mt-[6px]">
            {{ massForm.isRecurring ? $t('settings.holidayRecurringDesc') : $t('settings.holidayOneTimeDesc') }}
          </p>
        </div>
        <div class="flex gap-[10px] mt-[24px]">
          <button @click="saveMassAdd" :disabled="massLoading || massSelectedDates.length === 0" :class="submitBtnClass">
            <svg v-if="massLoading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ $t('settings.addHolidaysCount', { count: massSelectedDates.length }) }}
          </button>
          <button @click="closeMassAdd" class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- ── Single Delete Confirm ──────────────────────── -->
    <div v-if="deletingHoliday" class="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50" @click.self="deletingHoliday = null">
      <div class="bg-white dark:bg-neutral-800 rounded-[12px] p-[24px] w-full max-w-[380px] shadow-xl">
        <h3 class="text-[16px] font-bold text-black dark:text-white mb-[8px]">{{ $t('settings.deleteHoliday') }}</h3>
        <p class="text-[13px] text-[#808080] dark:text-neutral-400 mb-[20px]">{{ $t('settings.deleteHolidayConfirm', { name: deletingHoliday.name }) }}</p>
        <p class="text-[12px] text-amber-600 dark:text-amber-400 mb-[20px]">{{ $t('common.irreversibleAction') }}</p>
        <div class="flex gap-[10px]">
          <button @click="doDelete" :disabled="deleteLoading" class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] bg-red-600 text-white text-[14px] font-bold hover:bg-red-700 focus:outline-none">
            <svg v-if="deleteLoading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ $t('common.delete') }}
          </button>
          <button @click="deletingHoliday = null" class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- ── Mass Delete Confirm ────────────────────────── -->
    <div v-if="showMassDeleteConfirm" class="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50" @click.self="showMassDeleteConfirm = false">
      <div class="bg-white dark:bg-neutral-800 rounded-[12px] p-[24px] w-full max-w-[380px] shadow-xl">
        <h3 class="text-[16px] font-bold text-black dark:text-white mb-[8px]">{{ $t('settings.massDeleteHolidays') }}</h3>
        <p class="text-[13px] text-[#808080] dark:text-neutral-400 mb-[20px]">{{ $t('settings.massDeleteHolidaysConfirm', { count: selectedIds.size }) }}</p>
        <p class="text-[12px] text-amber-600 dark:text-amber-400 mb-[20px]">{{ $t('common.irreversibleAction') }}</p>
        <div class="flex gap-[10px]">
          <button @click="doMassDelete" :disabled="massDeleteLoading" class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] bg-red-600 text-white text-[14px] font-bold hover:bg-red-700 focus:outline-none">
            <svg v-if="massDeleteLoading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ $t('settings.massDeleteConfirmBtn', { count: selectedIds.size }) }}
          </button>
          <button @click="showMassDeleteConfirm = false" class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { useFormStyles } from '@/composables/useFormStyles';
import { extractApiError } from '@/utils/extractApiError';

const { t } = useI18n();
const { $toast } = useNuxtApp();
const centralStore = useCentralStore();
const { holidaysStore, permissionsStore } = centralStore;
const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

const canModify = computed(() => permissionsStore.can('public_holidays', 'modify'));

// ── Year navigation ───────────────────────────────────
const selectedYear = ref(new Date().getFullYear());
const loading = computed(() => holidaysStore.loading);

// Recurring holidays appear in every year view; moving ones only in their own year
const yearHolidays = computed(() =>
  holidaysStore.holidays.filter(h =>
    h.is_recurring || new Date(h.date + 'T00:00:00').getFullYear() === selectedYear.value
  )
);

const prevYear = () => { selectedYear.value--; holidaysStore.fetchHolidays(selectedYear.value); };
const nextYear = () => { selectedYear.value++; holidaysStore.fetchHolidays(selectedYear.value); };

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── Checkbox selection ────────────────────────────────
const selectedIds = ref(new Set());

const allVisibleSelected = computed(
  () => yearHolidays.value.length > 0 && yearHolidays.value.every(h => selectedIds.value.has(String(h.id)))
);
const someSelected = computed(
  () => yearHolidays.value.some(h => selectedIds.value.has(String(h.id))) && !allVisibleSelected.value
);

const toggleSelect = (id) => {
  const next = new Set(selectedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedIds.value = next;
};

const toggleSelectAll = () => {
  if (allVisibleSelected.value) {
    const next = new Set(selectedIds.value);
    yearHolidays.value.forEach(h => next.delete(String(h.id)));
    selectedIds.value = next;
  } else {
    const next = new Set(selectedIds.value);
    yearHolidays.value.forEach(h => next.add(String(h.id)));
    selectedIds.value = next;
  }
};

// ── Add / Edit ────────────────────────────────────────
const showForm = ref(false);
const editingHoliday = ref(null);
const form = ref({ name: '', date: '', isRecurring: true });
const formLoading = ref(false);

const openAdd = () => {
  editingHoliday.value = null;
  form.value = { name: '', date: selectedYear.value + '-01-01', isRecurring: true };
  showForm.value = true;
};
const openEdit = (holiday) => {
  editingHoliday.value = holiday;
  form.value = { name: holiday.name, date: holiday.date, isRecurring: holiday.is_recurring };
  showForm.value = true;
};
const closeForm = () => { showForm.value = false; editingHoliday.value = null; };

const saveHoliday = async () => {
  if (!form.value.name || !form.value.date) return;
  formLoading.value = true;
  try {
    if (editingHoliday.value) {
      await holidaysStore.updateHoliday(editingHoliday.value.id, form.value.date, form.value.name, form.value.isRecurring);
      $toast.success(t('settings.holidayUpdated'));
    } else {
      await holidaysStore.createHoliday(form.value.date, form.value.name, form.value.isRecurring);
      $toast.success(t('settings.holidayAdded'));
    }
    closeForm();
  } catch (error) {
    const { type, message } = extractApiError(error);
    $toast.error(type === 'user' && message ? message : t('settings.holidaySaveError'));
  } finally {
    formLoading.value = false;
  }
};

// ── Mass Add ──────────────────────────────────────────
const showMassAdd = ref(false);
const massDatePicker = ref(null);
const massSelectedDates = ref([]);
const massForm = ref({ name: '', isRecurring: false });
const massLoading = ref(false);
let massPickerInstance = null;

const openMassAdd = () => {
  massSelectedDates.value = [];
  massForm.value = { name: '', isRecurring: false };
  showMassAdd.value = true;
  nextTick(() => {
    massPickerInstance = flatpickr(massDatePicker.value, {
      mode: 'multiple',
      dateFormat: 'Y-m-d',
      onChange: (dates) => {
        massSelectedDates.value = dates.map(d => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        });
      },
    });
  });
};
const closeMassAdd = () => {
  showMassAdd.value = false;
  if (massPickerInstance) { massPickerInstance.destroy(); massPickerInstance = null; }
  massSelectedDates.value = [];
};

const saveMassAdd = async () => {
  if (massSelectedDates.value.length === 0) return;
  massLoading.value = true;
  try {
    const res = await holidaysStore.createHolidayBatch(
      massSelectedDates.value,
      massForm.value.name || null,
      massForm.value.isRecurring
    );
    $toast.success(t('settings.massAddSuccess', { count: res.created }));
    closeMassAdd();
  } catch (error) {
    const { type, message } = extractApiError(error);
    $toast.error(type === 'user' && message ? message : t('settings.holidaySaveError'));
  } finally {
    massLoading.value = false;
  }
};

// ── Single Delete ─────────────────────────────────────
const deletingHoliday = ref(null);
const deleteLoading = ref(false);

const confirmDelete = (holiday) => { deletingHoliday.value = holiday; };

const doDelete = async () => {
  if (!deletingHoliday.value) return;
  deleteLoading.value = true;
  try {
    await holidaysStore.deleteHoliday(deletingHoliday.value.id);
    selectedIds.value.delete(String(deletingHoliday.value.id));
    $toast.success(t('settings.holidayDeleted'));
    deletingHoliday.value = null;
  } catch (error) {
    const { type, message } = extractApiError(error);
    $toast.error(type === 'user' && message ? message : t('settings.holidayDeleteError'));
  } finally {
    deleteLoading.value = false;
  }
};

// ── Mass Delete ───────────────────────────────────────
const showMassDeleteConfirm = ref(false);
const massDeleteLoading = ref(false);

const confirmMassDelete = () => { showMassDeleteConfirm.value = true; };

const doMassDelete = async () => {
  massDeleteLoading.value = true;
  try {
    const ids = [...selectedIds.value];
    const res = await holidaysStore.deleteHolidayBatch(ids);
    selectedIds.value = new Set();
    showMassDeleteConfirm.value = false;
    $toast.success(t('settings.massDeleteSuccess', { count: res.deleted }));
  } catch (error) {
    const { type, message } = extractApiError(error);
    $toast.error(type === 'user' && message ? message : t('settings.holidayDeleteError'));
  } finally {
    massDeleteLoading.value = false;
  }
};
</script>
