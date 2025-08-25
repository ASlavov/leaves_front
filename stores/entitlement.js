import {defineStore, setActivePinia, createPinia} from 'pinia';
import {ref} from 'vue';
import {
    getEntitledDaysForUserComposable,
} from '@/composables/entitlementApiComposable';
import { useUserStore } from '@/stores/user';

export const useEntitlementStore = defineStore('entitlementStore', () => {
    const entitledDaysData = ref({
        savedUsers: [],
    });
    const loading = ref(false);
    const error = ref(null);
    const userStore = useUserStore();
    const isDataLoaded = ref(false);

    function reset() {
        entitledDaysData.value = {
            savedUsers: [],
        };
    }

    const setError = (errorMessage) => {
        // Reset error to force reactivity
        error.value = null;
        setTimeout(() => {
            error.value = errorMessage; // Set the actual error message
        });
    };

    async function init() {
        isDataLoaded.value = false;
        try {
            //Nothing to init

            /*await Promise.all([
            ]).then(() => {
                isDataLoaded.value = true;
            });*/
            isDataLoaded.value = true;
        } catch (err) {
            setError('Δεν μπορέσαμε να αρχικοποιήσουμε τα δεδομένα αδειών σας');
        }
    }
    async function getEntitledDaysForUser(userId) {
        // Check if data for this user is already cached
        if (entitledDaysData.value.savedUsers[userId]) {
            return entitledDaysData.value.savedUsers[userId];
        }

        try {
            loading.value = true;

            // Call the composable to fetch all entitlements for the user
            const result = await getEntitledDaysForUserComposable(userId);

            // Create an object to store entitlements, grouped by year
            const formattedResult = {};

            result.forEach(entitlement => {
                // Get the year from the start_from date
                const year = new Date(entitlement.start_from).getFullYear();

                // Ensure the array for this year exists
                formattedResult[year] ??= [];

                // Push the entitlement into the correct year's array
                formattedResult[year].push(entitlement);
            });

            // Cache the grouped result
            entitledDaysData.value.savedUsers[userId] = formattedResult;

            return formattedResult;

        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να φέρουμε τις άδειες σας');
        } finally {
            loading.value = false;
        }
    }

    async function newLeave(userId, leaveTypeId, startDate, endDate, reason) {

        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await newLeaveComposable({userId, leaveTypeId, startDate, endDate, reason});

            if (result) {
                await getAll(userId);
                await getLeavesAvailableDays(userId);
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function getAllUsers() {
        try {
            loading.value = true;
            const result = await getAllUserLeavesComposable();
            if(result) {
               leavesData.value.allUsers = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να ακυρώσουμε την άδεια');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }
    
    async function cancelLeave(userId, leaveId, status, reason) {
        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await cancelLeaveComposable({userId, leaveId, status, reason});

            if (result) {
                // Process the result and store it in leavesData
                await getAll(userId);
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να ακυρώσουμε την άδεια');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }


    return {
        entitledDaysData,
        loading,
        error,
        
        init,
        reset,
    };
});