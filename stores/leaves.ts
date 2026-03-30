import { defineStore, setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import {
    getUserLeavesComposable,
    newLeaveComposable,
    getLeavesStatusesComposable,
    getLeavesAvailableDaysComposable,
    cancelLeaveComposable,
    getAllUserLeavesComposable,
    adminLeaveActionComposable,
    updateLeaveTypeComposable,
    newLeaveTypeComposable,
    getLeavesTypesComposable,
    deleteLeaveTypeComposable,
    restoreLeaveTypeComposable,
} from '@/composables/leavesApiComposable';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import type { Leave, LeaveType, User } from '~/types';

export const useLeavesStore = defineStore('leavesStore', () => {
    const leavesData = ref<{
        currentUser: Record<string, any>;
        leavesTypes: LeaveType[];
        leavesStatuses: Record<string | number, string>;
        leavesAvailableDays: any[];
        allUsers: User[];
    }>({
        currentUser: {},
        leavesTypes: [],
        leavesStatuses: {},
        leavesAvailableDays: [],
        allUsers: [],
    });
    const loading = ref(false);
    const error = ref<string | null>(null);
    const userStore = useUserStore();
    const { t } = useI18n();
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

    const setError = (errorMessage: string | null) => {
        error.value = errorMessage;
    };

    const handleLeaveError = (err: any, defaultKey: string) => {
        const message = err?.data?.data?.message || err?.data?.message || err?.response?._data?.message || err?.message;
        
        switch (message) {
            case 'Leave request does not exist.':
                setError(t('errors.leaves.leaveDoesNotExist'));
                break;
            case 'User does not exist.':
                setError(t('errors.leaves.userDoesNotExist'));
                break;
            case 'User has no assigned roles.':
                setError(t('errors.leaves.userHasNoRoles'));
                break;
            case 'You cannot reject or accept your own leaves.':
                setError(t('errors.leaves.cannotProcessOwnLeave'));
                break;
            case 'User is not authorized.':
                setError(t('errors.leaves.userNotAuthorized'));
                break;
            case 'User is not head of department for this user or department is missing.':
                setError(t('errors.leaves.notHeadOfDepartment'));
                break;
            default:
                setError(t(defaultKey));
        }
    };

    async function init(userId: string | number) {
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
            setError(t('errors.leaves.initFailed'));
        }
    }

    async function getAllByUserId(userId: string | number) {

        try {
            loading.value = true;
            // Call the composable with the necessary parameters
            return await getUserLeavesComposable(userId);
        } catch (err) {
            // Handle errors and set the error state
            setError(t('errors.leaves.fetchFailed'));
        } finally {
        }

    }

    async function getAll(userId: string | number) {

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
            setError(t('errors.leaves.fetchFailed'));
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function newLeave(userId: string | number, leaveTypeId: string | number, startDate: string, endDate: string, reason: string) {

        try {
            loading.value = true;
            const result = await newLeaveComposable({ userId, leaveTypeId, startDate, endDate, reason });

            if (result) {
                await getAll(userId);
                await getLeavesAvailableDays(userId);
            }
        } catch (err) {
            setError(t('errors.leaves.createFailed'));
            throw err;
        } finally {
            loading.value = false;
        }

    }

    async function getAllUsers() {
        try {
            loading.value = true;
            const result = await getAllUserLeavesComposable();
            if (result) {
                leavesData.value.allUsers = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError(t('errors.leaves.fetchUsersFailed'));
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
            setError(t('errors.leaves.cancelFailed'));
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }*/
    async function cancelLeave(userId: string | number, leaveId: string | number, status: string, reason: string) {
        try {
            loading.value = true;
            const result = await cancelLeaveComposable({ userId, leaveId, status, reason });

            if (result) {
                await getAll(userId);
            } else {
                throw new Error(t('errors.leaves.cancelFailed'));
            }
        } catch (err: any) {
            handleLeaveError(err, 'errors.leaves.cancelFailed');
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function getLeavesTypes(includeArchived = false) {
        try {
            loading.value = true;
            const result = await getLeavesTypesComposable(includeArchived);
            if (result) {
                leavesData.value.leavesTypes = result;
            }
        } catch (err) {
            setError(t('errors.leaves.fetchTypesFailed'));
        } finally {
            loading.value = false;
        }
    }

    async function deleteLeaveType(id: string | number) {
        try {
            loading.value = true;
            await deleteLeaveTypeComposable(id);
        } catch (err) {
            setError(t('errors.leaves.deleteTypeFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function restoreLeaveType(id: string | number) {
        try {
            loading.value = true;
            await restoreLeaveTypeComposable(id);
        } catch (err) {
            setError(t('errors.leaves.restoreTypeFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateLeaveType(id: string | number, name: string, dependsOnTypeId?: string | number | null, allowRollover?: boolean) {
        try {
            loading.value = true;
            const result = await updateLeaveTypeComposable({ id, name, dependsOnTypeId, allowRollover });
            if (result) {
                await getLeavesTypes();
            }
        } catch (err) {
            setError(t('errors.leaves.updateTypeFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function createLeaveType(name: string, dependsOnTypeId?: string | number | null, allowRollover?: boolean) {
        try {
            loading.value = true;
            const result = await newLeaveTypeComposable({ name, dependsOnTypeId, allowRollover });
            if (result) {
                await getLeavesTypes();
            }
        } catch (err) {
            setError(t('errors.leaves.createTypeFailed'));
            throw err;
        } finally {
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
            setError(t('errors.leaves.fetchStatusesFailed'));
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }

    }

    async function getLeavesAvailableDays(userId: string | number) {

        try {
            // Call the composable with the necessary parameters
            const result = await getLeavesAvailableDaysComposable(userId);

            if (result) {
                // Process the result and store it in leavesData
                leavesData.value.leavesAvailableDays = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError(t('errors.leaves.fetchAvailableDaysFailed'));
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    async function approveLeave(userId: string | number, leaveId: string | number, status: string, reason: string) {
        try {
            loading.value = true;
            const result = await adminLeaveActionComposable({ userId, leaveId, status, reason });

            if (result) {
                await getAll(userId);
            } else {
                throw new Error(t('errors.leaves.approveFailed'));
            }
        } catch (err: any) {
            handleLeaveError(err, 'errors.leaves.approveFailed');
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function declineLeave(userId: string | number, leaveId: string | number, status: string, reason: string) {
        try {
            loading.value = true;
            const result = await adminLeaveActionComposable({ userId, leaveId, status, reason });

            if (result) {
                await getAll(userId);
            } else {
                throw new Error(t('errors.leaves.rejectFailed'));
            }
        } catch (err: any) {
            handleLeaveError(err, 'errors.leaves.rejectFailed');
            throw err;
        } finally {
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
        updateLeaveType,
        createLeaveType,
        deleteLeaveType,
        restoreLeaveType,
    };
});