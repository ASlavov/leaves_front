import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import getUserProfileComposable, {
    getAllUsersComposable,
    editUserComposable,
    addUserComposable,
    updatePasswordComposable
} from "~/composables/userApiComposable";
import type { User, AddUserPayload } from '~/types';
import { useDepartmentsStore } from '~/stores/departments';

export const useUserStore = defineStore('userStore', () => {
    const userId = ref<string | number | null>(null);
    const loading = ref(false);
    const permissions = ref<Record<string, boolean>>({}); // ['admin', 'hr', 'department_head', 'user']
    const userInfo = ref<User>({} as User);
    const allUsers = ref<User[]>([]);
    const error = ref<string | null>(null);
    const { t } = useI18n();
    const departmentsStore = useDepartmentsStore();

    function reset() {
        userInfo.value = {} as User;
        allUsers.value = [];
    }

    const setError = (errorMessage: string | null) => {
        error.value = errorMessage;
    };

    // Function to set the userId
    function setUserId(id: string | number) {
        userId.value = id;
    }

    function hasPermission(permission: string) {
        return permissions.value[permission] === true;
    }

    // Optionally, load user profile data based on userId
    async function loadUserProfile() {
        if (userId.value) {
            try {
                loading.value = true;
                const fullProfile = await getUserProfileComposable(userId.value);
                permissions.value = {
                    "edit_user": true,
                    "delete_user": true,
                    "view_leaves": false,
                    "view_all_users": false,
                    "edit_department": true,
                };//Uncomment when API is ready: fullProfile.permissions;
                userInfo.value = fullProfile;
            } catch (err) {
                setError(t('errors.user.fetchProfileFailed'));
            } finally {
                loading.value = false;
            }
        }
    }

    // Optionally, load user profile data based on userId
    async function loadUserProfileById(userId: string | number) {
        return allUsers.value.find((element: User) => element.id === userId) || [];
    }

    async function editUser(
        targetUserId: string | number,
        userName: string,
        userEmail: string,
        userDepartment: string | number,
        userRole: string | number | string[],
        userPhone: string,
        userInternalPhone: string,
        userTitle: string,
        userTitleDescription: string,
        userImage: string | File
    ) {

        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await editUserComposable({
                userId: targetUserId,
                userName,
                userEmail,
                userDepartment,
                userRole,
                userPhone,
                userInternalPhone,
                userTitle,
                userTitleDescription,
                userImage
            });

            if (result) {
                if (result.errors) {
                    throw new Error();
                }
                if (targetUserId === userId.value) {
                    await loadUserProfile();
                } else {
                    await getAllUsers();
                }
                try { await departmentsStore.getAll(); } catch (e) { console.error('Failed to refresh departments', e); }
            }
        } catch (err) {
            setError(t('errors.user.editFailed'));
            throw err;
        } finally {
            loading.value = false;
        }

    }

    async function updatePassword(data: Record<string, any>) {
        const {
            userId,
            oldPass,
            newPass,
        } = data;

        try {
            loading.value = true;
            const result = await updatePasswordComposable({
                userId,
                oldPass,
                newPass,
            });
            if (result) {
                // Nothing else to do here
            }
        } catch (err) {
            setError(t('errors.user.changePasswordFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function addUser(
        userName: string,
        userEmail: string,
        userDepartment: string | number,
        userRole: string | number,
        userPassword: string,
        userPhone: string,
        userInternalPhone: string,
        userTitle: string,
        userTitleDescription: string,
        userImage: string
    ) {
        try {
            loading.value = true;
            const result = await addUserComposable({
                userName,
                userEmail,
                userDepartment,
                userRole,
                userPassword,
                userPhone,
                userInternalPhone,
                userTitle,
                userTitleDescription,
                userImage,
            });

            if (result?.errors) {
                throw new Error();
            }

            await getAllUsers();
            try { await departmentsStore.getAll(); } catch (e) { console.error('Failed to refresh departments', e); }
        } catch (err) {
            setError(t('errors.user.editFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getAllUsers() {
        if (userId.value) {
            try {
                loading.value = true;
                allUsers.value = Object.values(await getAllUsersComposable());
            } catch (err) {
                setError(t('errors.user.fetchUsersFailed'));
            } finally {
                loading.value = false;
            }
        }
    }

    async function init() {
        try {
            if (!Object.keys(userInfo.value).length) {
                loading.value = true;
                await loadUserProfile();
            }
            if (!allUsers.value.length) {
                await getAllUsers();
            }
        } catch (err) {
            setError(t('errors.user.initFailed'));
        } finally {
            loading.value = false;
        }
    }


    return {
        userId,
        reset,
        userInfo,
        permissions,
        hasPermission,
        editUser,
        setUserId,
        loading,
        loadUserProfile,
        loadUserProfileById,
        init,
        error,
        allUsers,
        getAllUsers,
        addUser,
        updatePassword
    };
});
