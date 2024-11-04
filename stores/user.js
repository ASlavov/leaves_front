import {defineStore} from 'pinia';
import {ref} from 'vue';
import getUserProfileComposable, {
    getAllUsersComposable,
    editUserComposable,
    updatePasswordComposable
} from "~/composables/userApiComposable.js";
import {newLeaveComposable} from "~/composables/leavesApiComposable.js";

export const useUserStore = defineStore('userStore', () => {
    const userId = ref(null);
    const loading = ref(false);
    const permissions  = ref({}); // ['admin', 'hr', 'department_head', 'user']
    const userInfo = ref({});
    const allUsers = ref([]);
    const error = ref(null);

    function reset() {
        userInfo.value = {};
        userInfo.allUsers = [];
    }

    const setError = (errorMessage) => {
        // Reset error to force reactivity
        error.value = null;
        setTimeout(() => {
            error.value = errorMessage; // Set the actual error message
        });
    };

    // Function to set the userId
    function setUserId(id) {
        userId.value = id;
    }

    function hasPermission(permission) {
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
                setError('Δεν μπορέσαμε να φέρουμε το προφίλ σας');
            } finally {
                loading.value = false;
            }
        }
    }

    // Optionally, load user profile data based on userId
    async function loadUserProfileById(userId) {
        return allUsers.value.find(element => element.id === userId) || [];
    }

    //editUserComposable
    async function editUser(
        userId,
        userName,
        userEmail,
        userDepartment,
        userRole,
        userPhone,
        userInternalPhone,
        userTitle,
        userTitleDescription,
        userImage
    ) {

        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await editUserComposable({
                userId,
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
                if(userId === this.userId) {
                    await loadUserProfile();
                } else {
                    await getAllUsers();
                }
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να επεξεργαστούμε τον χρήστη');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function updatePassword(data) {
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
            setError('Δεν μπορέσαμε να αλλάξουμε τον κωδικό σας');
        } finally {
            loading.value = false;
        }
    }

    async function getAllUsers() {
        if (userId.value) {
            try {
                loading.value = true;
                allUsers.value = Object.values(await getAllUsersComposable(userId.value));
            } catch (err) {
                setError('Δεν μπορέσαμε να φέρουμε το προφίλ σας');
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
            if(!allUsers.value.length) {
                await getAllUsers();
            }
        } catch (err) {
            setError('Δεν μπορέσαμε να αρχικοποιήσουμε το προφίλ σας');
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
        updatePassword
    };
});
