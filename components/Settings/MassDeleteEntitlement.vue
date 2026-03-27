<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">

    <!-- ── Step 1: Selection ─────────────────────────────── -->
    <template v-if="step === 1">
      <div class="flex flex-wrap gap-[15px]">

        <div class="w-[300px]">
          <CustomSelect
            v-model="leaveTypeId"
            :options="leaveTypeOptions"
            :label="$t('settings.leaveType') + ' <span class=\'text-[#EA021A]\'>*</span>'"
            :placeholder="$t('settings.selectLeaveType')"
            selectId="mass-delete-leave-type"
          />
        </div>

        <div class="w-[300px]">
          <label :class="labelClass">{{ $t('common.year') }} <span class="text-[#EA021A]">*</span></label>
          <input
            v-model.number="year"
            type="number"
            :class="inputClass"
            :placeholder="String(new Date().getFullYear())"
            min="2000"
            max="2100"
          />
        </div>

        <div class="w-full">
          <label :class="labelClass">
            {{ $t('settings.employees') }}
            <span class="text-[12px] font-normal text-[#808080] ml-1">({{ $t('settings.leaveAllEmpty') }})</span>
          </label>
          <CustomMultiSelect
            v-model="userIds"
            :options="userOptions"
            :placeholder="$t('settings.selectEmployees')"
          />
        </div>

        <div class="w-full pt-[15px]">
          <button @click="runPreview" :disabled="!leaveTypeId || !year || previewLoading" :class="submitBtnClass">
            <svg v-if="previewLoading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ $t('common.preview') }}
          </button>
        </div>

      </div>
    </template>

    <!-- ── Step 2: Preview ───────────────────────────────── -->
    <template v-else-if="step === 2">
      <div class="flex flex-col gap-[16px]">

        <!-- Nothing found -->
        <div v-if="preview.safe_count === 0 && preview.blocked_count === 0"
             class="text-[14px] text-[#808080] dark:text-neutral-400 py-[8px]">
          {{ $t('settings.massDeleteNothingFound') }}
        </div>

        <template v-else>
          <!-- Safe count -->
          <div class="flex items-center gap-[10px] p-[14px] rounded-[8px] bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <svg class="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-[14px] text-green-700 dark:text-green-400 font-bold">
              {{ $t('settings.massDeletePreviewSafe', { count: preview.safe_count }) }}
            </span>
          </div>

          <!-- Blocked -->
          <div v-if="preview.blocked_count > 0" class="flex flex-col gap-[10px]">
            <div class="flex items-start gap-[10px] p-[14px] rounded-[8px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <svg class="h-5 w-5 text-amber-500 shrink-0 mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <div>
                <p class="text-[14px] text-amber-700 dark:text-amber-400 font-bold mb-[4px]">
                  {{ $t('settings.massDeletePreviewBlocked', { count: preview.blocked_count }) }}
                </p>
                <p class="text-[13px] text-amber-600 dark:text-amber-500">
                  {{ $t('settings.massDeleteBlockedWarning') }}
                </p>
              </div>
            </div>

            <!-- Blocked users list -->
            <div class="rounded-[8px] border border-[#DFEAF2] dark:border-neutral-600 overflow-hidden">
              <div class="grid grid-cols-2 px-[14px] py-[8px] bg-gray-50 dark:bg-neutral-800 text-[12px] font-bold text-[#808080] dark:text-neutral-400 uppercase tracking-wide">
                <span>{{ $t('settings.employee') }}</span>
                <span>{{ $t('settings.daysUsed') }}</span>
              </div>
              <div
                v-for="user in preview.blocked_users"
                :key="user.user_id"
                class="grid grid-cols-2 px-[14px] py-[10px] text-[13px] border-t border-[#DFEAF2] dark:border-neutral-700 text-black dark:text-gray-100"
              >
                <span>{{ user.user_name }}</span>
                <span class="text-amber-600 dark:text-amber-400 font-bold">{{ user.days_used }}</span>
              </div>
            </div>

            <!-- Force checkbox -->
            <label class="flex items-start gap-[10px] cursor-pointer select-none mt-[4px]">
              <input
                v-model="force"
                type="checkbox"
                class="mt-[2px] h-4 w-4 rounded border-[#DFEAF2] dark:border-neutral-600 accent-[#EA021A] cursor-pointer"
              />
              <span class="text-[13px] text-gray-700 dark:text-neutral-300">
                {{ $t('settings.massDeleteForceLabel') }}
              </span>
            </label>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-[12px] pt-[8px]">
            <button
              @click="runDelete"
              :disabled="deleteLoading || (preview.safe_count === 0 && !force)"
              :class="[
                submitBtnClass,
                (preview.safe_count === 0 && !force) ? 'opacity-40 cursor-not-allowed' : ''
              ]"
            >
              <svg v-if="deleteLoading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ $t('settings.massDeleteConfirm', { count: force ? (preview.safe_count + preview.blocked_count) : preview.safe_count }) }}
            </button>
            <button
              @click="step = 1; force = false"
              class="inline-flex items-center justify-center py-[15px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors focus:outline-none"
            >
              {{ $t('common.back') }}
            </button>
          </div>
        </template>

        <!-- Back only if nothing found -->
        <div v-if="preview.safe_count === 0 && preview.blocked_count === 0">
          <button
            @click="step = 1"
            class="inline-flex items-center justify-center py-[15px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors focus:outline-none"
          >
            {{ $t('common.back') }}
          </button>
        </div>
      </div>
    </template>

    <!-- ── Step 3: Result ────────────────────────────────── -->
    <template v-else-if="step === 3">
      <div class="flex flex-col items-center gap-[20px] py-[20px]">
        <div class="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg class="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <p class="text-[15px] font-bold text-black dark:text-white text-center">
          {{ result.skipped > 0
            ? $t('settings.massDeleteSuccessSkipped', { deleted: result.deleted, skipped: result.skipped })
            : $t('settings.massDeleteSuccess', { deleted: result.deleted })
          }}
        </p>
        <button @click="emit('saved')" :class="submitBtnClass">
          {{ $t('common.done') }}
        </button>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';
import { useFormStyles } from '@/composables/useFormStyles';
import { extractApiError } from '@/utils/extractApiError';

const { t } = useI18n();
const { $toast } = useNuxtApp();
const emit = defineEmits(['saved']);

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;
const entitlementStore = centralStore.entitlementStore;

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

// ── Form state ──────────────────────────────────────────
const step = ref(1);
const leaveTypeId = ref(null);
const year = ref(new Date().getFullYear());
const userIds = ref([]);
const force = ref(false);
const previewLoading = ref(false);
const deleteLoading = ref(false);

const preview = ref({ safe_count: 0, blocked_count: 0, blocked_users: [] });
const result = ref({ deleted: 0, skipped: 0 });

// ── Options ─────────────────────────────────────────────
const leaveTypeOptions = computed(() =>
  leavesStore.leavesData.leavesTypes
    .filter(t => !t.deleted_at)
    .map(t => ({ id: t.id, name: t.name }))
);

const userOptions = computed(() =>
  userStore.allUsers.map(u => ({ id: u.id, name: u.name }))
);

// ── Actions ─────────────────────────────────────────────
const runPreview = async () => {
  previewLoading.value = true;
  try {
    const res = await entitlementStore.massDeleteEntitlements(
      leaveTypeId.value,
      year.value,
      userIds.value,
      true,   // dry_run
      false
    );
    preview.value = res;
    step.value = 2;
  } catch (error) {
    const { type, message } = extractApiError(error);
    $toast.error(type === 'user' && message ? message : t('errors.entitlement.massDeleteFailed'));
  } finally {
    previewLoading.value = false;
  }
};

const runDelete = async () => {
  deleteLoading.value = true;
  try {
    const res = await entitlementStore.massDeleteEntitlements(
      leaveTypeId.value,
      year.value,
      userIds.value,
      false,           // dry_run
      force.value
    );
    result.value = res;
    step.value = 3;
  } catch (error) {
    const { type, message } = extractApiError(error);
    $toast.error(type === 'user' && message ? message : t('errors.entitlement.massDeleteFailed'));
  } finally {
    deleteLoading.value = false;
  }
};
</script>
