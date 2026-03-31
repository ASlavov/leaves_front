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
          select-id="new-leave-type-select"
        />
      </div>

      <!-- Entitled Days -->
      <div class="w-[300px]">
        <label :class="labelClass"
          >{{ $t('settings.entitledDays') }} <span class="text-[#EA021A]">*</span></label
        >
        <input v-model="newLeavesData.entitled_days" type="number" :class="inputClass" min="0" />
      </div>

      <!-- Selection Mode Toggle -->
      <div class="w-full">
        <label :class="labelClass"
          >{{ $t('settings.assignTo') }} <span class="text-[#EA021A]">*</span></label
        >
        <div
          class="flex p-1 bg-gray-100 rounded-lg dark:bg-neutral-800 border border-[#DFEAF2] dark:border-neutral-600 w-fit"
        >
          <button
            :class="
              selectionMode === 'users'
                ? 'bg-white shadow-sm dark:bg-neutral-700 dark:text-gray-100'
                : 'text-gray-500 dark:text-neutral-400'
            "
            class="px-4 py-2 rounded-md text-sm font-bold transition-all"
            @click="selectionMode = 'users'"
          >
            {{ $t('common.users') }}
          </button>
          <button
            :class="
              selectionMode === 'groups'
                ? 'bg-white shadow-sm dark:bg-neutral-700 dark:text-gray-100'
                : 'text-gray-500 dark:text-neutral-400'
            "
            class="px-4 py-2 rounded-md text-sm font-bold transition-all"
            @click="selectionMode = 'groups'"
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
          <button
            class="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            @click="addAll"
          >
            {{ $t('common.addAll') }}
          </button>
          <button
            class="text-xs font-bold text-red-600 hover:underline dark:text-red-400"
            @click="clearAll"
          >
            {{ $t('common.clearAll') }}
          </button>
        </div>
      </div>

      <!-- Submit -->
      <div class="w-full pt-[15px]">
        <button :class="submitBtnClass" :disabled="loading" @click="assignLeaves">
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
          {{ $t('settings.assignLeave') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';
import { useI18n } from 'vue-i18n';
import { useFormStyles } from '@/composables/useFormStyles';
import { extractApiError } from '@/utils/extractApiError';
import { useLeavesTypesReactive } from '@/composables/leavesApiComposable';
import { useAllUsers } from '@/composables/userApiComposable';
import type { User, LeaveType } from '@/types';

const { t } = useI18n();
const emit = defineEmits(['cancel', 'saved']);
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

// Reactive fetching
const { data: remoteLeaveTypes, pending: loadingTypes } = useLeavesTypesReactive(false);
const { data: remoteUsers, pending: loadingUsers } = useAllUsers();

const loadingState = ref(false);
const loading = computed(() => loadingState.value || loadingTypes.value || loadingUsers.value);
const selectionMode = ref<'users' | 'groups'>('users');

interface NewLeavesForm {
  leave_type_id: string | number;
  entitled_days: number;
  user_ids: (string | number)[];
  department_ids: (string | number)[];
}

const newLeavesData = reactive<NewLeavesForm>({
  leave_type_id: '',
  entitled_days: 0,
  user_ids: [],
  department_ids: [],
});

const leaveTypeOptions = computed(() => {
  const types = remoteLeaveTypes.value || leavesStore.leavesData?.leavesTypes || [];
  return types.map((type: LeaveType) => ({ id: type.id, name: type.name }));
});

const userOptions = computed(() => {
  const users = remoteUsers.value || userStore.allUsers || [];
  return users.map((user: User) => ({ id: user.id, name: user.name }));
});

const groupOptions = computed(() => {
  const users = remoteUsers.value || userStore.allUsers || [];
  const departments = users
    .map((user: User) => user.department)
    .filter(
      (dept: any, index: number, self: any[]) =>
        dept && self.findIndex((d: any) => d && d.id === dept.id) === index,
    );
  return departments.map((dept: any) => ({ id: dept.id, name: dept.name }));
});

const addAll = () => {
  if (selectionMode.value === 'users') {
    newLeavesData.user_ids = userOptions.value.map((o: any) => o.id);
  } else {
    newLeavesData.department_ids = groupOptions.value.map((o: any) => o.id);
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
    (useNuxtApp() as any).$toast.error(t('settings.fillAllFields'));
    return;
  }

  loadingState.value = true;
  try {
    let targetUserIds = [...newLeavesData.user_ids];
    const allUsersList = remoteUsers.value || userStore.allUsers || [];

    if (selectionMode.value === 'groups' && newLeavesData.department_ids.length > 0) {
      const groupUsers = allUsersList
        .filter((u: User) => u.department && newLeavesData.department_ids.includes(u.department.id))
        .map((u: User) => u.id);
      targetUserIds = [...new Set([...targetUserIds, ...groupUsers])];
    }

    if (targetUserIds.length === 0) {
      (useNuxtApp() as any).$toast.error(t('settings.selectEmployees'));
      return;
    }

    await leavesStore.assignLeaves({
      leave_type_id: newLeavesData.leave_type_id,
      entitled_days: newLeavesData.entitled_days,
      user_ids: targetUserIds,
    });

    (useNuxtApp() as any).$toast.success(t('settings.leaveAdded'));
    emit('saved');
  } catch (error) {
    const { type, message } = extractApiError(error);
    (useNuxtApp() as any).$toast.error(
      type === 'user' && message ? message : t('settings.saveLeaveError'),
    );
  } finally {
    loadingState.value = false;
  }
};
</script>
