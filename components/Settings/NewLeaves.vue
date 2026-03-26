<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">
    <div class="flex flex-wrap gap-[15px]">
      <!-- Leave Type -->
      <div class="w-[300px]">
        <CustomSelect
            v-model="newLeavesData.leave_type_id"
            :options="leaveTypeOptions"
            :label="$t('settings.leaveType') + ' <span class=\'text-[#EA021A]\'>*</span>'"
            :placeholder="$t('settings.selectLeaveType')"
            selectId="new-leave-type-select"
        />
      </div>

      <!-- Entitled Days -->
      <div class="w-[300px]">
        <label :class="labelClass">{{ $t('settings.entitledDays') }} <span class="text-[#EA021A]">*</span></label>
        <input
            v-model="newLeavesData.entitled_days"
            type="number"
            :class="inputClass"
            min="0"
        />
      </div>

      <!-- Selection Mode Toggle -->
      <div class="w-full">
        <label :class="labelClass">{{ $t('settings.assignTo') }} <span class="text-[#EA021A]">*</span></label>
        <div class="flex p-1 bg-gray-100 rounded-lg dark:bg-neutral-800 border border-[#DFEAF2] dark:border-neutral-600 w-fit">
          <button
              @click="selectionMode = 'users'"
              :class="selectionMode === 'users' ? 'bg-white shadow-sm dark:bg-neutral-700 dark:text-gray-100' : 'text-gray-500 dark:text-neutral-400'"
              class="px-4 py-2 rounded-md text-sm font-bold transition-all"
          >
            {{ $t('common.users') }}
          </button>
          <button
              @click="selectionMode = 'groups'"
              :class="selectionMode === 'groups' ? 'bg-white shadow-sm dark:bg-neutral-700 dark:text-gray-100' : 'text-gray-500 dark:text-neutral-400'"
              class="px-4 py-2 rounded-md text-sm font-bold transition-all"
          >
            {{ $t('settings.group') }}
          </button>
        </div>
      </div>

      <!-- User/Group Selection -->
      <div class="w-full">
        <div v-if="selectionMode === 'users'">
          <label :class="labelClass">{{ $t('settings.selectUsers') }}</label>
          <CustomMultiSelect
              v-model="newLeavesData.user_ids"
              :options="userOptions"
              :placeholder="$t('settings.selectUsers')"
          />
        </div>
        <div v-if="selectionMode === 'groups'">
          <label :class="labelClass">{{ $t('settings.selectGroups') }}</label>
          <CustomMultiSelect
              v-model="newLeavesData.department_ids"
              :options="groupOptions"
              :placeholder="$t('settings.selectGroups')"
          />
        </div>
        <div class="flex gap-2 pt-2">
          <button @click="addAll" class="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400">{{ $t('common.addAll') }}</button>
          <button @click="clearAll" class="text-xs font-bold text-red-600 hover:underline dark:text-red-400">{{ $t('common.clearAll') }}</button>
        </div>
      </div>

      <!-- Submit -->
      <div class="w-full pt-[15px]">
        <button @click="assignLeaves" :class="submitBtnClass" :disabled="loading">
          <svg v-if="loading" class="animate-spin h-4 w-4 text-white mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ $t('settings.assignLeave') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';
import { useI18n } from 'vue-i18n';
import { useFormStyles } from '@/composables/useFormStyles';

const { t } = useI18n();
const emit = defineEmits(['cancel', 'saved']);
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

const loading = ref(false);
const selectionMode = ref('users');

const newLeavesData = reactive({
  leave_type_id: '',
  entitled_days: 0,
  user_ids: [],
  department_ids: [],
});

const leaveTypeOptions = computed(() => {
  return leavesStore.leavesData?.leavesTypes?.map(type => ({ id: type.id, name: type.name })) || [];
});

const userOptions = computed(() => {
  return userStore.allUsers.map(user => ({ id: user.id, name: user.name }));
});

const groupOptions = computed(() => {
  const departments = userStore.allUsers
      .map(user => user.department)
      .filter((dept, index, self) => dept && self.findIndex(d => d.id === dept.id) === index);
  return departments.map(dept => ({ id: dept.id, name: dept.name }));
});

const addAll = () => {
  if (selectionMode.value === 'users') {
    newLeavesData.user_ids = userOptions.value.map(o => o.id);
  } else {
    newLeavesData.department_ids = groupOptions.value.map(o => o.id);
  }
};

const clearAll = () => {
  if (selectionMode.value === 'users') {
    newLeavesData.user_ids = [];
  } else {
    newLeavesData.department_ids = [];
  }
};

const assignLeaves = async () => {
  if (!newLeavesData.leave_type_id || newLeavesData.entitled_days < 0) {
    useNuxtApp().$toast.error(t('settings.fillAllFields'));
    return;
  }

  loading.value = true;
  try {
    let targetUserIds = [...newLeavesData.user_ids];
    if (selectionMode.value === 'groups' && newLeavesData.department_ids.length > 0) {
      const groupUsers = userStore.allUsers
          .filter(u => newLeavesData.department_ids.includes(u.department.id))
          .map(u => u.id);
      targetUserIds = [...new Set([...targetUserIds, ...groupUsers])];
    }

    if (targetUserIds.length === 0) {
      useNuxtApp().$toast.error(t('settings.selectEmployees'));
      return;
    }

    await leavesStore.assignLeaves({
      leave_type_id: newLeavesData.leave_type_id,
      entitled_days: newLeavesData.entitled_days,
      user_ids: targetUserIds,
    });

    useNuxtApp().$toast.success(t('settings.leaveAdded'));
    emit('saved');
  } catch (error) {
    useNuxtApp().$toast.error(t('settings.saveLeaveError'));
  } finally {
    loading.value = false;
  }
};
</script>
