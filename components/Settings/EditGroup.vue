<template>
  <div
    :class="
      asModal
        ? ''
        : 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100'
    "
  >
    <div class="flex-1">
      <template v-if="componentLoading">
        <div class="px-[30px] py-[30px] flex flex-wrap gap-[15px]">
          <div v-for="i in 3" :key="i" class="w-[300px]">
            <div
              class="h-[14px] bg-gray-200 dark:bg-neutral-700 rounded w-1/3 mb-[8px] animate-pulse"
            ></div>
            <div class="h-[40px] bg-gray-200 dark:bg-neutral-700 rounded-[8px] animate-pulse"></div>
          </div>
          <div class="w-full">
            <div
              class="h-[14px] bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-[8px] animate-pulse"
            ></div>
            <div class="h-[40px] bg-gray-200 dark:bg-neutral-700 rounded-[8px] animate-pulse"></div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          :class="
            asModal ? 'px-[30px] pb-[30px] pt-[10px]' : 'grid grid-cols-12 pt-[30px] max-w-[947px]'
          "
        >
          <div
            :class="
              asModal
                ? 'flex flex-wrap gap-[15px]'
                : 'grid grid-cols-2 col-span-12 lg:col-span-10 gap-y-[15px] gap-x-[25px]'
            "
          >
            <!-- Group Name -->
            <div :class="asModal ? 'w-[300px]' : 'w-full col-span-2 sm:col-span-1'">
              <label :class="labelClass"
                >{{ $t('settings.groupName') }} <span class="text-[#EA021A]">*</span></label
              >
              <input
                v-model="formGroupName"
                type="text"
                :class="inputClass"
                :placeholder="$t('settings.groupName')"
              />
            </div>
            <!-- Group Head -->
            <div :class="asModal ? 'w-[300px]' : 'w-full col-span-2 sm:col-span-1'">
              <CustomSelect
                v-model="formSelectedDepartmentHead"
                :options="availableFormUsers"
                :label="$t('settings.groupHead') + ' <span class=\'text-[#EA021A]\'>*</span>'"
                :placeholder="$t('settings.selectHead')"
                select-id="department-head-select"
              />
            </div>
            <!-- Members -->
            <div :class="asModal ? 'w-full' : 'col-span-2'">
              <div :class="labelClass">{{ $t('settings.users') }}</div>
              <CustomMultiSelect
                v-model="formUsers"
                :options="allUsers"
                :placeholder="$t('settings.selectUsers')"
              />
            </div>
            <!-- Submit -->
            <div
              :class="
                asModal ? 'w-full pt-[15px]' : 'info-actions pt-10 pb-5 flex gap-4 col-span-2'
              "
            >
              <button :class="submitBtnClass" @click="submitForm">
                {{ $t('settings.saveChanges') }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';
import { useFormStyles } from '@/composables/useFormStyles';
import { extractApiError } from '@/utils/extractApiError';
import type { User, Department } from '@/types';

const { t } = useI18n();
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

const loadingUsers = computed(() => userStore.loading);
const loadingGroup = ref(false);
const componentLoading = computed(() => loadingUsers.value || loadingGroup.value);

const props = defineProps({
  groupId: {
    type: [Number, String] as PropType<number | string | undefined>,
    required: false,
    default: undefined,
  },
  entitlementId: {
    type: [Number, String, null] as PropType<number | string | null>,
    required: false,
    default: null,
  },
  asModal: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'deleted', 'saved']);

const formGroupName = ref('');
const formSelectedDepartmentHead = ref<string | number | undefined>(undefined);
const formUsers = ref<(string | number)[]>([]);

const allUsers = computed(() =>
  userStore.allUsers.map((user: User) => {
    const name = user.name || '';
    const nameSplit = name.trim().split(' ');
    const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0] || '';
    const lastName = nameSplit.slice(-1).join(' ') || '';
    return { ...user, firstName, lastName };
  }),
);

watch(
  () => props.groupId,
  async (newGroupId) => {
    if (newGroupId) {
      loadingGroup.value = true;
      try {
        const dptData = await departmentsStore.loadGroupById(newGroupId);
        if (dptData) {
          initializeFormFields(dptData);
        }
      } catch {
        (useNuxtApp() as any).$toast.error(t('leaves.cancelError'), {
          position: 'bottom-right',
          autoClose: 5000,
        });
      } finally {
        loadingGroup.value = false;
      }
    } else {
      // Reset form for new group
      formGroupName.value = '';
      formUsers.value = [];
      formSelectedDepartmentHead.value = undefined;
    }
  },
  { immediate: true },
);

function initializeFormFields(dptData: Department) {
  formGroupName.value = dptData.name;
  formUsers.value = dptData.users?.map((user: { id: string | number }) => user.id) || [];
  formSelectedDepartmentHead.value = dptData.head || undefined;
}

const availableFormUsers = computed(() => {
  return allUsers.value.filter((user: User) => formUsers.value.includes(user.id));
});

const submitForm = async () => {
  if (!formGroupName.value || !formSelectedDepartmentHead.value || formUsers.value.length === 0) {
    (useNuxtApp() as any).$toast.error(t('settings.fillRequiredFields'));
    return;
  }

  const groupId = props.groupId;
  const groupName = formGroupName.value;
  const head = formSelectedDepartmentHead.value;
  const members = formUsers.value;

  try {
    if (!groupId) {
      await departmentsStore.newDepartment(
        groupName,
        head as string | number,
        members as (string | number)[],
      );
    } else {
      await departmentsStore.editDepartment(
        groupId,
        groupName,
        head as string | number,
        members as (string | number)[],
      );
    }
    (useNuxtApp() as any).$toast.success(t('settings.groupUpdated'));
    emit('saved');
  } catch (error) {
    const { type, message } = extractApiError(error);
    (useNuxtApp() as any).$toast.error(
      type === 'user' && message ? message : t('settings.saveGroupError'),
    );
  }
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
