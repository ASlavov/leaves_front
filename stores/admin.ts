import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AdminLeavePayload, TerminationPreviewResponse } from '~/types';
import {
  recordAdminLeaveComposable,
  previewTerminationComposable,
  terminateUserComposable,
} from '@/composables/adminApiComposable';

export const useAdminStore = defineStore('adminStore', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
  };

  async function recordAdministrativeLeave(payload: AdminLeavePayload) {
    try {
      loading.value = true;
      error.value = null;
      return await recordAdminLeaveComposable(payload);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to record administrative leave');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function previewTermination(
    userId: string | number,
    terminationDate: string,
  ): Promise<TerminationPreviewResponse> {
    try {
      loading.value = true;
      error.value = null;
      return await previewTerminationComposable(userId, terminationDate);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to preview termination');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function terminateUser(userId: string | number, terminationDate: string) {
    try {
      loading.value = true;
      error.value = null;
      return await terminateUserComposable(userId, terminationDate);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to terminate user');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, recordAdministrativeLeave, previewTermination, terminateUser };
});
