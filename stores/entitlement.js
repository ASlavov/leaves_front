import {defineStore, setActivePinia, createPinia} from 'pinia';
import {ref} from 'vue';
import {
    addEntitledDaysForUserComposable,
    getEntitledDaysForUserComposable,
    deleteEntitledDaysForUserComposable,
    updateEntitledDaysForUserComposable,
    addEntitledDaysForMultipleUsersComposable,
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
    async function getEntitledDaysForUser(userId, forceRefresh = false) {
        // Check if data for this user is already cached
        if (!forceRefresh && entitledDaysData.value.savedUsers[userId]) {
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
/*
    async function addEntitledDaysForUser(
        userId,
        leaveTypeId,
        entitledDays,
        startDate,
        endDate
    ) {
        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const year = new Date(startDate).getFullYear();
            const result = await addEntitledDaysForUserComposable({
                ...arguments,
                year,
            });

            if (result && result.entitlement) {
                await getEntitledDaysForUser(userId, true);
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }*/

    async function addEntitledDays(
        userIds, // <-- Accepts an array of user IDs
        leaveTypeId,
        entitledDays,
        startDate,
        endDate
    ) {
        try {
            loading.value = true;

            const year = new Date(startDate).getFullYear();

            if (userIds.length > 1) {
                // Call the bulk endpoint for multiple users
                await addEntitledDaysForMultipleUsersComposable({
                    userIds,
                    leaveTypeId,
                    entitledDays,
                    year,
                    startDate,
                    endDate
                });
            } else {
                // Call the single-user endpoint
                const userId = userIds[0];
                await addEntitledDaysForUserComposable({
                    userId,
                    leaveTypeId,
                    entitledDays,
                    year,
                    startDate,
                    endDate
                });
            }

            // After successful creation, clear the cache for all affected users
            // and refetch their data to ensure UI consistency.
            for (const id of userIds) {
                await getEntitledDaysForUser(id, true);
            }

        } catch (err) {
            setError('Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια/ες');
            throw err; // Re-throw the error to be handled by the component
        } finally {
            loading.value = false;
        }
    }


    async function updateEntitledDaysForUser(
        entitlementId,
        userId,
        leaveTypeId,
        entitledDays,
        startDate,
        endDate
    ) {
        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const year = new Date(startDate).getFullYear();
            const result = await updateEntitledDaysForUserComposable({
                ...arguments,
                year,
            });

            if (result && result.entitlement) {
                await getEntitledDaysForUser(userId, true);
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function deleteEntitledDaysForUser(userId, entitlementId) {
        try {
            loading.value = true;
            // Call the composable with the necessary parameters

            const result = await deleteEntitledDaysForUserComposable(entitlementId);

            if (result) {
                await getEntitledDaysForUser(userId, true);
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να δημιουργήσουμε νέα άδεια');
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
        addEntitledDays,
        deleteEntitledDaysForUser,
        getEntitledDaysForUser,
        updateEntitledDaysForUser,
    };
});