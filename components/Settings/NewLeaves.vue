<template>
  <div class="p-6 bg-white dark:bg-neutral-800 rounded-xl border dark:border-neutral-700 shadow-sm max-w-4xl mx-auto mt-6">
    <h2 class="text-2xl font-bold mb-8 dark:text-gray-100 border-b pb-4 dark:border-neutral-700">{{ $t('settings.assignLeavesTitle') }}</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Leave Configuration -->
      <div class="space-y-6">
        <!-- Leave Type -->
        <div class="flex flex-col space-y-2">
          <label class="text-sm font-bold uppercase text-gray-400 dark:text-neutral-500">{{ $t('settings.leaveType') }}</label>
          <CustomSelect
              v-model="newLeavesData.leave_type_id"
              :options="leaveTypeOptions"
              :placeholder="$t('settings.selectLeaveType')"
          />
        </div>

        <!-- Entitled Days -->
        <div class="flex flex-col space-y-2">
          <label class="text-sm font-bold uppercase text-gray-400 dark:text-neutral-500">{{ $t('settings.entitledDays') }}</label>
          <div class="relative group">
            <input
                v-model="newLeavesData.entitled_days"
                type="number"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-neutral-900 dark:border-neutral-700 dark:text-gray-100"
                min="0"
            />
          </div>
        </div>

        <!-- Selection Mode Toggle -->
        <div class="flex flex-col space-y-2">
          <label class="text-sm font-bold uppercase text-gray-400 dark:text-neutral-500">{{ $t('settings.assignTo') }}</label>
          <div class="flex p-1 bg-gray-100 rounded-lg dark:bg-neutral-900 border dark:border-neutral-700 w-fit">
            <button
                @click="selectionMode = 'users'"
                :class="selectionMode === 'users' ? 'bg-white shadow-sm dark:bg-neutral-800' : 'text-gray-500'"
                class="px-4 py-2 rounded-md text-sm font-bold transition-all"
            >
              {{ $t('common.users') }}
            </button>
            <button
                @click="selectionMode = 'groups'"
                :class="selectionMode === 'groups' ? 'bg-white shadow-sm dark:bg-neutral-800' : 'text-gray-500'"
                class="px-4 py-2 rounded-md text-sm font-bold transition-all"
            >
              {{ $t('settings.group') }}
            </button>
          </div>
        </div>
      </div>

      <!-- User/Group Selection -->
      <div class="space-y-6">
        <div v-if="selectionMode === 'users'" class="flex flex-col space-y-2">
          <label class="text-sm font-bold uppercase text-gray-400 dark:text-neutral-500">{{ $t('settings.selectUsers') }}</label>
          <CustomMultiSelect
              v-model="newLeavesData.user_ids"
              :options="userOptions"
              :placeholder="$t('settings.selectUsers')"
          />
        </div>
        <div v-if="selectionMode === 'groups'" class="flex flex-col space-y-2">
          <label class="text-sm font-bold uppercase text-gray-400 dark:text-neutral-500">{{ $t('settings.selectGroups') }}</label>
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
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 mt-12 pt-6 border-t dark:border-neutral-700">
      <button
          @click="$emit('cancel')"
          class="px-8 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
      >
        {{ $t('common.cancel') }}
      </button>
      <button
          @click="assignLeaves"
          class="px-8 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-all flex items-center gap-2"
          :disabled="loading"
      >
        <svg v-if="loading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ $t('settings.assignLeave') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['cancel', 'saved']);
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;

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
    // Collect all unique user IDs if groups selected
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
