<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">
    <div>
      <!-- Leave Type Name -->
      <div class="mb-[20px]">
        <label :class="labelClass">{{ $t('settings.leaveTypeName') }} <span class="text-[#EA021A]">*</span></label>
        <input
          v-model="leaveTypeData.name"
          type="text"
          :class="inputClass"
          :placeholder="$t('settings.leaveTypePlaceholder')"
        />
      </div>

      <!-- Submit -->
      <div class="pt-[10px]">
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
import { ref, onMounted } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import { useI18n } from 'vue-i18n';
import { useFormStyles } from '@/composables/useFormStyles';

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

const leaveTypeData = ref({ name: '' });

onMounted(() => {
  if (props.leaveTypeId && leavesStore.leavesData?.leavesTypes) {
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
    if (props.leaveTypeId) {
      await leavesStore.updateLeaveType(props.leaveTypeId, leaveTypeData.value.name);
      useNuxtApp().$toast.success(t('settings.leaveUpdated'));
    } else {
      await leavesStore.createLeaveType(leaveTypeData.value.name);
      useNuxtApp().$toast.success(t('settings.leaveAdded'));
    }
    emit('saved');
  } catch (error) {
    useNuxtApp().$toast.error(props.leaveTypeId ? t('errors.leaves.updateTypeFailed') : t('errors.leaves.createTypeFailed'));
  } finally {
    loading.value = false;
  }
};
</script>
