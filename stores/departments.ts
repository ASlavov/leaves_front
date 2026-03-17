import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Department } from '~/types';
import { getAllDepartmentsComposable, newDepartmentComposable, editDepartmentComposable } from '@/composables/departmentsApiComposable';

export const useDepartmentsStore = defineStore('departmentsStore', () => {
    const departmentsData = ref<Department[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    function reset() {
        departmentsData.value = [];
    }
    const setError = (errorMessage: string | null) => {
        error.value = errorMessage;
    };
    async function init() {
        try {
            if (!departmentsData.value.length) {
                await getAll();
            }
        } catch (err) {
            setError('Δεν μπορέσαμε να αρηκοποιήσουμε τα γκρουπς');
        }
    }

    async function getAll() {
        try {
            // Call the composable with the necessary parameters
            const result = await getAllDepartmentsComposable();

            if (result) {
                // Process the result and store it in departmentsData
                departmentsData.value = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να φέρουμε τα γκρουπς');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    function loadGroupById(groupId: string | number) {
        return departmentsData.value.find((group: Department) => group.id === groupId) || {};
    }

    async function newDepartment(
        groupName: string,
        head: string | number,
        members: (string | number)[]
    ) {
        try {
            // Call the composable with the necessary parameters
            const result = await newDepartmentComposable({
                groupName,
                head,
                members
            });

            if (result) {
                // Recall getAll to refresh the store data.
                await getAll();
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να δημιουργήσουμε νέο γκρουπ');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function editDepartment(
        groupId: string | number,
        groupName: string,
        head: string | number,
        members: (string | number)[]
    ) {
        try {
            // Call the composable with the necessary parameters
            const result = await editDepartmentComposable({
                groupId,
                groupName,
                head,
                members
            });

            if (result) {
                // Recall getAll to refresh the store data.
                await getAll();
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να επεξεργαστούμε το γκρουπ που ζητήσατε');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function deleteDepartment(department_id: string | number) {
        try {
            // Call the composable with the necessary parameters
            const result = await deleteDepartmentComposable(department_id);

            if (result) {
                // Recall getAll to refresh the store data.
                await getAll();
            }
        } catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να σβήσουμε το γκρουπ που ζητήσατε');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    return {
        init,
        reset,
        getAll,
        loadGroupById,
        newDepartment,
        editDepartment,
        deleteDepartment,
        departmentsData,
        loading,
        error
    };
});