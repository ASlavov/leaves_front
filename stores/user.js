import {defineStore} from 'pinia';
import {ref} from 'vue';
import getUserProfileComposable, {getAllUsersComposable} from "~/composables/userApiComposable.js";

export const useUserStore = defineStore('userStore', () => {
    const userId = ref(null);
    const loading = ref(false);
    //const profile = ref({});  // You can add more user-related data here
    const userInfo = ref({});
    const allUsers = ref({});
    const error = ref(null);

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

    // Optionally, load user profile data based on userId
    async function loadUserProfile() {
        if (userId.value) {
            try {
                const fullProfile = await getUserProfileComposable(userId.value);
                userInfo.value = fullProfile;
            } catch (err) {
                setError('Δεν μπορέσαμε να φέρουμε το προφίλ σας');
            }
        }
    }

    async function getAllUsers() {
        if (userId.value) {
            try {
                allUsers.value = await getAllUsersComposable(userId.value);
            } catch (err) {
                setError('Δεν μπορέσαμε να φέρουμε το προφίλ σας');
            }
        }
    }

    async function init() {
        try {
            if (!Object.keys(userInfo.value).length) {
                await loadUserProfile();
            }
        } catch (err) {
            setError('Δεν μπορέσαμε να αρχικοποιήσουμε το προφίλ σας');
        }
    }


    return { userId, userInfo, setUserId, loading, loadUserProfile, init, error, allUsers, getAllUsers };
});
