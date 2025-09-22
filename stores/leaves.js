import {defineStore, setActivePinia, createPinia} from 'pinia';
import {ref} from 'vue';
import {
    getUserLeavesComposable,
    newLeaveComposable,
    getLeavesStatusesComposable,
    getLeavesAvailableDaysComposable,
    cancelLeaveComposable, getAllUserLeavesComposable,
    adminLeaveActionComposable
} from '@/composables/leavesApiComposable';
import { useUserStore } from '@/stores/user';

export const useLeavesStore = defineStore('leavesStore', () => {
    const leavesData = ref({
        currentUser: {},
        leavesTypes: [],
        leavesStatuses: {},
        leavesAvailableDays: [],
        allUsers: [],
    });
    const loading = ref(false);
    const error = ref(null);
    const userStore = useUserStore();
    const isDataLoaded = ref(false);

    function reset() {
        leavesData.value = {
            currentUser: {},
            leavesTypes: [],
            leavesStatuses: {},
            leavesAvailableDays: [],
            allUsers: [],
        };
    }

    const setError = (errorMessage) => {
        // Reset error to force reactivity
        error.value = null;
        setTimeout(() => {
            error.value = errorMessage; // Set the actual error message
        });
    };

    async function init(userId) {
        isDataLoaded.value = false;
        try {
            await Promise.all([
                !Object.keys(leavesData.value.currentUser).length && getAll(userId),
                !leavesData.value.leavesTypes.length && getLeavesTypes(),
                !Object.keys(leavesData.value.leavesStatuses).length && getLeavesStatuses(),
                !Object.keys(leavesData.value.leavesAvailableDays).length && getLeavesAvailableDays(userId),
            ]).then(() => {
                isDataLoaded.value = true;
            });
        } catch (err) {
            setError('Δεν μπορέσαμε να αρχικοποιήσουμε τα δεδομένα αδειών σας');
        }
    }

    async function getAllByUserId(userId) {

        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            return await getUserLeavesComposable(userId);
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να φέρουμε τις άδειες σας');
        } finally {
        }

    }

    async function getAll(userId) {

        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await getUserLeavesComposable(userId);

            if (result) {
                // Process the result and store it in userData
                leavesData.value.currentUser = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να φέρουμε τις άδειες σας');
        } finally {
            // Ensure loading is set to false and any post-processing is done
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
    /*async function editLeave(userId, leaveId, status, reason) {
        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await editLeaveComposable({userId, leaveId, status, reason});

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
    }*/
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

    async function getLeavesTypes() {

        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await getLeavesTypesComposable();

            if (result) {
                // Process the result and store it in leavesData
                leavesData.value.leavesTypes = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να φέρουμε τους τύπους αδειών');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function getLeavesStatuses() {

        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await getLeavesStatusesComposable();

            if (result) {
                // Process the result and store it in leavesData
                leavesData.value.leavesStatuses = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να φέρουμε τις διαθέσιμες ενέργειες αδειών');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function getLeavesAvailableDays(userId) {

        try {
            // Call the composable with the necessary parameters
            const result = await getLeavesAvailableDaysComposable(userId);

            if (result) {
                // Process the result and store it in leavesData
                leavesData.value.leavesAvailableDays = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να φέρουμε τις υπολοιπόμενες ήμερες αδειών σας');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function approveLeave(userId, leaveId, status, reason) {
        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await adminLeaveActionComposable({userId, leaveId, status, reason});

            if (result) {
                // Process the result and store it in leavesData
                await getAll(userId);
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να εγκρύνουμε την άδεια');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function declineLeave(userId, leaveId, status, reason) {
        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            const result = await adminLeaveActionComposable({userId, leaveId, status, reason});

            if (result) {
                // Process the result and store it in leavesData
                await getAll(userId);
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να απορρίψουμε την άδεια');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }




    return {
        leavesData,
        loading,
        error,
        isDataLoaded,
        init,
        reset,
        getAll,
        newLeave,
        cancelLeave,
        getAllByUserId,
        getLeavesTypes,
        getAllUsers,
        getLeavesStatuses,
        getLeavesAvailableDays,
        approveLeave,
        declineLeave,
    };
});