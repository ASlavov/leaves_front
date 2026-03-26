<template>
  <div :class="asModal ? '' : 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100'">
    <div class="flex-1">

      <!-- ── MODAL MODE ── -->
      <template v-if="asModal">
        <template v-if="loading">
          <!-- Modal skeleton: centered avatar + flex-wrap field skeletons -->
          <div class="flex justify-center pt-[30px] pb-[20px]">
            <div class="w-[110px] h-[110px] bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
          </div>
          <div class="px-[30px] pb-[30px] flex flex-wrap gap-[15px]">
            <div v-for="i in 6" :key="i" class="w-[300px]">
              <div class="h-[14px] bg-gray-200 dark:bg-neutral-700 rounded w-1/3 mb-[8px] animate-pulse"></div>
              <div class="h-[40px] bg-gray-200 dark:bg-neutral-700 rounded-[8px] animate-pulse"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <!-- Centered avatar -->
          <div class="flex justify-center pt-[30px] pb-[20px]">
            <div class="relative w-[110px] h-[110px] bg-gray-300 dark:bg-neutral-600 rounded-full flex items-center justify-center">
              <img
                v-if="userPhoto"
                @click="triggerFileSelect"
                class="cursor-pointer w-[110px] h-[110px] rounded-full object-cover"
                :src="userPhoto"
                alt="Avatar"
              >
              <span v-else class="text-white font-bold text-lg">
                {{ firstNameInitial }}{{ lastNameInitial }}
              </span>
              <button
                @click="triggerFileSelect"
                class="absolute bottom-0 right-0 w-[25px] h-[25px] bg-[#EA021A] rounded-full flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 15 15" fill="none">
                  <g clip-path="url(#clip0_edit_modal)">
                    <path d="M14.5872 4.16284L13.2366 5.51343C13.0989 5.65112 12.8763 5.65112 12.7386 5.51343L9.48661 2.26147C9.34892 2.12378 9.34892 1.90112 9.48661 1.76343L10.8372 0.412842C11.385 -0.13501 12.2757 -0.13501 12.8265 0.412842L14.5872 2.17358C15.138 2.72144 15.138 3.61206 14.5872 4.16284ZM8.32646 2.92358L0.633095 10.6169L0.0120011 14.1765C-0.0729598 14.657 0.345986 15.073 0.826454 14.991L4.38602 14.3669L12.0794 6.67358C12.2171 6.53589 12.2171 6.31323 12.0794 6.17554L8.82743 2.92358C8.68681 2.78589 8.46415 2.78589 8.32646 2.92358ZM3.63602 9.95776C3.47489 9.79663 3.47489 9.53882 3.63602 9.37769L8.14774 4.86597C8.30888 4.70483 8.56669 4.70483 8.72782 4.86597C8.88895 5.0271 8.88895 5.28491 8.72782 5.44605L4.2161 9.95776C4.05497 10.1189 3.79716 10.1189 3.63602 9.95776ZM2.57841 12.4216H3.98466V13.4851L2.09501 13.8162L1.18388 12.905L1.51493 11.0154H2.57841V12.4216Z" fill="white"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_edit_modal">
                      <rect width="15" height="15" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </button>
              <input type="file" ref="fileInput" @change="handleFileChange" accept="image/jpeg,image/png" class="hidden">
            </div>
          </div>

          <!-- Flex-wrap form grid -->
          <div class="px-[30px]">
            <div class="flex flex-wrap gap-[15px]">
              <!-- First Name -->
              <div class="w-[300px]">
                <label :class="labelClass">{{ $t('settings.firstName') }} <span class="text-[#EA021A]">*</span></label>
                <input v-model="formFirstName" type="text" :class="inputClass" :placeholder="$t('settings.firstName')">
              </div>
              <!-- Last Name -->
              <div class="w-[300px]">
                <label :class="labelClass">{{ $t('settings.lastName') }}</label>
                <input v-model="formLastName" type="text" :class="inputClass" :placeholder="$t('settings.lastName')">
              </div>
              <!-- Title -->
              <div class="w-[300px]">
                <label :class="labelClass">{{ $t('settings.jobTitle') }}</label>
                <input v-model="formTitle" type="text" :class="inputClass" :placeholder="$t('settings.jobTitle')">
              </div>
              <!-- Phone -->
              <div class="w-[300px]">
                <label :class="labelClass">{{ $t('settings.phone') }}</label>
                <input v-model="formPhone" pattern="[0-9]{10}" type="tel" :class="inputClass" :placeholder="$t('settings.phone')">
              </div>
              <!-- Internal Phone -->
              <div class="w-[300px]">
                <label :class="labelClass">{{ $t('settings.internalPhone') }}</label>
                <input v-model="formInternalPhone" type="number" :class="inputClass" :placeholder="$t('settings.internalPhone')">
              </div>
              <!-- Email -->
              <div class="w-[300px]">
                <label :class="labelClass">Email <span class="text-[#EA021A]">*</span></label>
                <input v-model="formEmail" type="email" :class="inputClass" placeholder="Email">
              </div>
              <!-- Group -->
              <div v-if="permissionsStore.can('group', 'modify')" class="w-[300px]">
                <CustomSelect
                  v-model="formSelectedDepartmentId"
                  :options="departments"
                  :label="$t('settings.group') + ' <span class=\'text-[#EA021A]\'>*</span>'"
                  :placeholder="$t('settings.selectGroup')"
                  selectId="department-select"
                />
              </div>
              <!-- Role -->
              <div v-if="canEdit" class="w-[300px]">
                <CustomSelect
                  v-model="formRole"
                  :options="roles"
                  :label="$t('settings.role') + ' <span class=\'text-[#EA021A]\'>*</span>'"
                  :placeholder="$t('settings.selectRole')"
                  selectId="role-select"
                />
              </div>
              <!-- Password (new user only) -->
              <div v-if="isNewUser" class="w-[300px]">
                <label :class="labelClass">{{ $t('settings.password') }} <span class="text-[#EA021A]">*</span></label>
                <input v-model="formPassword" type="password" :class="inputClass" :placeholder="$t('settings.password')">
              </div>
            </div>
            <!-- Submit -->
            <div class="pt-[30px] pb-[30px]">
              <button @click="submitForm" :class="submitBtnClass">
                {{ isNewUser ? $t('settings.addUser') : $t('settings.saveChanges') }}
              </button>
            </div>
          </div>
        </template>
      </template>

      <!-- ── INLINE MODE (ProfileInfo) ── -->
      <template v-else>
        <template v-if="loading">
          <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
            <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
            <div class="pt-4 space-y-2 col-span-10 animate-pulse">
              <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
              <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
              <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
              <p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-neutral-700"></p>
              <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
              <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
              <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
            <!-- Avatar (inline: left column) -->
            <div class="relative w-[132px] h-[132px] bg-gray-300 dark:bg-neutral-600 rounded-full mr-4 flex items-center justify-center col-span-2">
              <img
                @click="triggerFileSelect"
                v-if="userPhoto"
                class="cursor-pointer inline-block w-[132px] h-[132px] rounded-full object-cover"
                :src="userPhoto"
                alt="Avatar"
              >
              <span v-else class="text-white font-bold">
                {{ firstNameInitial }}{{ lastNameInitial }}
              </span>
              <button @click="triggerFileSelect" class="absolute bottom-1 right-1 transform bg-[#EA021A] rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <g clip-path="url(#clip0_edit_inline)">
                    <path d="M14.5872 4.16284L13.2366 5.51343C13.0989 5.65112 12.8763 5.65112 12.7386 5.51343L9.48661 2.26147C9.34892 2.12378 9.34892 1.90112 9.48661 1.76343L10.8372 0.412842C11.385 -0.13501 12.2757 -0.13501 12.8265 0.412842L14.5872 2.17358C15.138 2.72144 15.138 3.61206 14.5872 4.16284ZM8.32646 2.92358L0.633095 10.6169L0.0120011 14.1765C-0.0729598 14.657 0.345986 15.073 0.826454 14.991L4.38602 14.3669L12.0794 6.67358C12.2171 6.53589 12.2171 6.31323 12.0794 6.17554L8.82743 2.92358C8.68681 2.78589 8.46415 2.78589 8.32646 2.92358ZM3.63602 9.95776C3.47489 9.79663 3.47489 9.53882 3.63602 9.37769L8.14774 4.86597C8.30888 4.70483 8.56669 4.70483 8.72782 4.86597C8.88895 5.0271 8.88895 5.28491 8.72782 5.44605L4.2161 9.95776C4.05497 10.1189 3.79716 10.1189 3.63602 9.95776ZM2.57841 12.4216H3.98466V13.4851L2.09501 13.8162L1.18388 12.905L1.51493 11.0154H2.57841V12.4216Z" fill="white"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_edit_inline">
                      <rect width="15" height="15" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </button>
              <input type="file" ref="fileInput" @change="handleFileChange" accept="image/jpeg,image/png" class="hidden">
            </div>
            <!-- Info Details -->
            <div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px]">
              <div class="max-w-sm">
                <label :class="labelClass">{{ $t('settings.firstName') }} <span class="text-[#EA021A]">*</span></label>
                <input v-model="formFirstName" type="text" :class="inputClass" :placeholder="$t('settings.firstName')">
              </div>
              <div class="max-w-sm">
                <label :class="labelClass">{{ $t('settings.lastName') }}</label>
                <input v-model="formLastName" type="text" :class="inputClass" :placeholder="$t('settings.lastName')">
              </div>
              <div class="max-w-sm">
                <label :class="labelClass">{{ $t('settings.jobTitle') }}</label>
                <input v-model="formTitle" type="text" :class="inputClass" :placeholder="$t('settings.jobTitle')">
              </div>
              <div class="max-w-sm">
                <label :class="labelClass">Email <span class="text-[#EA021A]">*</span></label>
                <input v-model="formEmail" type="email" :class="inputClass" placeholder="Email">
              </div>
              <div class="max-w-sm">
                <label :class="labelClass">{{ $t('settings.phone') }}</label>
                <input v-model="formPhone" pattern="[0-9]{10}" type="tel" :class="inputClass" :placeholder="$t('settings.phone')">
              </div>
              <div class="max-w-sm">
                <label :class="labelClass">{{ $t('settings.internalPhone') }}</label>
                <input v-model="formInternalPhone" type="number" :class="inputClass" :placeholder="$t('settings.internalPhone')">
              </div>
              <div v-if="permissionsStore.can('group', 'modify')" class="max-w-sm">
                <CustomSelect
                  v-model="formSelectedDepartmentId"
                  :options="departments"
                  :label="$t('settings.group') + ' <span class=\'text-[#EA021A]\'>*</span>'"
                  :placeholder="$t('settings.selectGroup')"
                  selectId="department-select"
                />
              </div>
              <div v-if="canEdit" class="max-w-sm">
                <CustomSelect
                  v-model="formRole"
                  :options="roles"
                  :label="$t('settings.role') + ' <span class=\'text-[#EA021A]\'>*</span>'"
                  :placeholder="$t('settings.selectRole')"
                  selectId="role-select"
                />
              </div>
              <div class="info-actions pt-10 pb-5 flex gap-4 col-span-2">
                <button @click="submitForm" :class="submitBtnClass">
                  {{ isNewUser ? $t('settings.addUser') : $t('settings.saveChanges') }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import { useFormStyles } from '@/composables/useFormStyles';

const { t } = useI18n();
const router = useRouter();
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;
const permissionsStore = centralStore.permissionsStore;
const { $toast } = useNuxtApp();
const emit = defineEmits(['saved']);

const { input: inputClass, label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

// Loading state
const loading = computed(() => userStore && userStore.loading);

const props = defineProps({
  userId: {
    type: [Number, String, null],
    required: false,
  },
  asModal: {
    type: Boolean,
    default: false,
  },
});

const isNewUser = computed(() => !props.userId);
const formPassword = ref('');

const canEdit = computed(() => {
    return permissionsStore.can('all_users', 'modify');
});

// File input reference
const fileInput = ref(null);

// Reactive variables for form fields
const formFirstName = ref('');
const formLastName = ref('');
const formEmail = ref('');
const formImage = ref('');
const formTitle = ref('');
const formPhone = ref('');
const formRole = ref('');
const formInternalPhone = ref('');
const formTitleDescription = ref('');
const formPhoto = ref('');
const formSelectedDepartmentId = ref(null);

// Computed properties for avatar initials
const firstNameInitial = computed(() => formFirstName.value.charAt(0) || '');
const lastNameInitial = computed(() => formLastName.value.charAt(0) || '');
const userPhoto = computed(() => formPhoto.value);

// Lists
const departments = computed(() => departmentsStore.departmentsData);
const roles = computed(() => permissionsStore.allRoles);

const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      formImage.value = base64Data;
      formPhoto.value = base64Data;
    };
    reader.readAsDataURL(file);
  } else {
    $toast.error(t('settings.selectImageError'), { position: "bottom-right", autoClose: 5000 });
  }
};

onMounted(() => {
  if (centralStore.initialized) {
    fetchUserData();
  } else {
    const unwatch = watch(
        () => centralStore.initialized,
        (initialized) => {
          if (initialized) {
            fetchUserData();
            unwatch();
          }
        },
        { immediate: true }
    );
  }
});

watch(
    () => props.userId,
    () => {
      if (centralStore.initialized) {
        fetchUserData();
      }
    }
);

async function fetchUserData() {
  try {
    if (props.userId) {
      const newUserInfo = await userStore.loadUserProfileById(props.userId);
      if (newUserInfo) {
        initializeFormFields(newUserInfo);
      }
    }
  } catch (error) {
    $toast.error('Error fetching user data.', { position: "bottom-right", autoClose: 5000 });
  }
}

function initializeFormFields(userInfo) {
  const userName = userInfo.name || '';
  const nameParts = userName.split(' ');
  formFirstName.value = nameParts[0] || '';
  formLastName.value = nameParts.slice(1).join(' ') || '';
  formEmail.value = userInfo.email || '';
  formImage.value = '';
  formTitle.value = userInfo.profile?.job_title || '';
  formPhone.value = userInfo.profile?.phone || '';
  formRole.value = userInfo?.roles[0].id || '4';
  formInternalPhone.value = userInfo.profile?.internal_phone || '';
  formTitleDescription.value = userInfo.profile?.title_description || '';
  formSelectedDepartmentId.value = String(userInfo.department?.id || '');
  formPhoto.value = userInfo.profile?.profile_image_base64 || null;
}

const submitForm = async () => {
  const userId = props.userId;
  const userName = `${formFirstName.value} ${formLastName.value}`.trim();
  const userEmail = formEmail.value;
  const userDepartment = formSelectedDepartmentId.value;
  const userRole = formRole.value;
  const userPhone = String(parseInt(formPhone.value) || '');
  const userInternalPhone = formInternalPhone.value;
  const userTitle = formTitle.value;
  const userTitleDescription = formTitleDescription.value || formTitle.value;
  const userImage = formImage.value;

  try {
    if (isNewUser.value) {
      if (!userName || !userEmail || !userDepartment || !userRole || !formPassword.value) {
        $toast.error(t('settings.requiredFieldsMissing'), { position: 'bottom-right', autoClose: 5000 });
        return;
      }
      await userStore.addUser(
        userName, userEmail, userDepartment, userRole,
        formPassword.value, userPhone, userInternalPhone,
        userTitle, userTitleDescription, userImage
      );
    } else {
      await userStore.editUser(
        userId, userName, userEmail, userDepartment, userRole,
        userPhone, userInternalPhone, userTitle, userTitleDescription, userImage
      );
    }
    $toast.success(t('settings.profileUpdated'), { position: 'bottom-right', autoClose: 5000 });
    emit('saved');
  } catch (error) {
    $toast.error(t('settings.profileUpdateError'), { position: 'bottom-right', autoClose: 5000 });
  }
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
