import { defineStore, setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { getUserLeavesComposable, newLeaveComposable, getLeavesStatusesComposable } from '@/composables/leavesApiComposable';

export const useLeavesStore = defineStore('leavesStore', () => {
    const leavesData = ref({
        currentUser: {},
        leavesTypes: {},
        leavesStatuses: {},
    });
    const loading = ref(false);
    const error = ref(null);


    async function getAll(userId) {

        try {
            // Call the composable with the necessary parameters
            const result = await getUserLeavesComposable(userId);

            if (result) {
                // Process the result and store it in userData
                leavesData.value.currentUser = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            error.value = err;
            console.error('Error fetching response:', err);
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function newLeave(userId, leaveTypeId, startDate, endDate, reason) {

        try {
            // Call the composable with the necessary parameters
            const result = await newLeaveComposable({ userId, leaveTypeId, startDate, endDate, reason });

            if (result) {
                // Process the result and store it in userData
                leavesData.value.data = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            error.value = err;
            console.error('Error fetching response:', err);
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function getLeavesTypes() {

        try {
            // Call the composable with the necessary parameters
            const result = await getLeavesTypesComposable();

            if (result) {
                // Process the result and store it in userData
                leavesData.value.leavesTypes = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            error.value = err;
            console.error('Error fetching response:', err);
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function getLeavesStatuses() {

        try {
            // Call the composable with the necessary parameters
            const result = await getLeavesStatusesComposable();

            if (result) {
                // Process the result and store it in userData
                leavesData.value.leavesStatuses = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            error.value = err;
            console.error('Error fetching response:', err);
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    return { leavesData, loading, error, getAll, newLeave, getLeavesTypes, getLeavesStatuses };
});