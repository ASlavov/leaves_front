<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">
    <div class="flex flex-wrap gap-[15px]">

      <!-- Leave Type Name -->
      <div class="w-full">
        <label :class="labelClass">{{ $t('settings.leaveTypeName') }} <span class="text-[#EA021A]">*</span></label>
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
          selectId="depends-on-type-select"
        />
      </div>

      <!-- Allow Rollover toggle -->
      <div class="w-full">
        <div class="flex items-center gap-[10px]">
          <button
            type="button"
            @click="leaveTypeData.allowRollover = !leaveTypeData.allowRollover"
            :class="[
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              leaveTypeData.allowRollover ? 'bg-[#EA021A]' : 'bg-gray-200 dark:bg-neutral-600'
            ]"
          >
            <span :class="['pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ease-in-out', leaveTypeData.allowRollover ? 'translate-x-4' : 'translate-x-0']" />
          </button>
          <span
            class="text-[14px] font-bold text-black dark:text-gray-100 cursor-pointer select-none"
            @click="leaveTypeData.allowRollover = !leaveTypeData.allowRollover"
          >
            {{ $t('settings.allowRollover') }}
          </span>
        </div>
        <p v-if="!leaveTypeData.allowRollover" class="mt-[6px] text-[12px] text-amber-600 dark:text-amber-400">
          {{ $t('settings.allowRolloverOff') }}
        </p>
      </div>

      <!-- Submit -->
      <div class="w-full pt-[10px]">
        <button @click="saveLeaveType" :class="submitBtnClass" :disabled="loading">
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24">
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
import { ref, computed, onMounted } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import { useI18n } from 'vue-i18n';
import { useFormStyles } from '@/composables/useFormStyles';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import { extractApiError } from '@/utils/extractApiError';

const { t } = useI18n();
const props = defineProps({
  leaveTypeId: {
    type: [Number, String, null],
    required: false,
  },
});

const emit = defineEmits(['cancel', 'saved']);
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const loading = ref(false);

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

const leaveTypeData = ref({ name: '', dependsOnTypeId: null, allowRollover: true });

const dependsOnOptions = computed(() => [
  { id: '', name: `— ${t('common.none')} —` },
  ...leavesStore.leavesData.leavesTypes
    .filter(lt => !lt.deleted_at && String(lt.id) !== String(props.leaveTypeId))
    .map(lt => ({ id: lt.id, name: lt.name })),
]);

onMounted(() => {
  if (props.leaveTypeId && leavesStore.leavesData?.leavesTypes) {
    const type = leavesStore.leavesData.leavesTypes.find(t => String(t.id) === String(props.leaveTypeId));
    if (type) {
      leaveTypeData.value.name = type.name;
      leaveTypeData.value.dependsOnTypeId = type.depends_on_type_id ?? '';
      leaveTypeData.value.allowRollover = type.allow_rollover !== false;
    }
  }
});

const saveLeaveType = async () => {
  if (!leaveTypeData.value.name) return;

  loading.value = true;
  try {
    const dependsOnTypeId = leaveTypeData.value.dependsOnTypeId || null;
    if (props.leaveTypeId) {
      await leavesStore.updateLeaveType(
        props.leaveTypeId,
        leaveTypeData.value.name,
        dependsOnTypeId,
        leaveTypeData.value.allowRollover
      );
      useNuxtApp().$toast.success(t('settings.leaveUpdated'));
    } else {
      await leavesStore.createLeaveType(
        leaveTypeData.value.name,
        dependsOnTypeId,
        leaveTypeData.value.allowRollover
      );
      useNuxtApp().$toast.success(t('settings.leaveAdded'));
    }
    emit('saved');
  } catch (error) {
    const { type, message } = extractApiError(error);
    useNuxtApp().$toast.error(type === 'user' && message ? message : (props.leaveTypeId ? t('errors.leaves.updateTypeFailed') : t('errors.leaves.createTypeFailed')));
  } finally {
    loading.value = false;
  }
};
</script>
