import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CompanyDocument, CreateDocumentPayload } from '~/types';
import {
  getDocumentsComposable,
  createDocumentComposable,
  updateDocumentComposable,
  deleteDocumentComposable,
} from '~/composables/documentsApiComposable';

export const useDocumentsStore = defineStore('documentsStore', () => {
  const documents = ref<CompanyDocument[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const { t } = useI18n();

  const companyDocuments = computed(() => documents.value.filter((d) => d.target_type === 'all'));
  const personalDocuments = computed(() => documents.value.filter((d) => d.target_type === 'user'));

  const reset = () => {
    documents.value = [];
    error.value = null;
    loading.value = false;
  };

  const setError = (msg: string | null) => {
    error.value = msg;
  };

  const fetchDocuments = async (targetUserId?: number) => {
    try {
      loading.value = true;
      setError(null);
      const res = await getDocumentsComposable(targetUserId);
      if (res) documents.value = res;
    } catch (err: any) {
      console.error(err);
      setError(t('errors.documents.fetchFailed'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createDocument = async (payload: CreateDocumentPayload) => {
    try {
      loading.value = true;
      setError(null);
      await createDocumentComposable(payload);
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      setError(t('errors.documents.uploadFailed'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateDocument = async (id: number | string, payload: Partial<CreateDocumentPayload>) => {
    try {
      loading.value = true;
      setError(null);
      await updateDocumentComposable(id, payload);
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      setError(t('errors.documents.uploadFailed'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDocument = async (id: number | string) => {
    try {
      loading.value = true;
      setError(null);
      await deleteDocumentComposable(id);
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      setError(t('errors.documents.deleteFailed'));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    documents,
    companyDocuments,
    personalDocuments,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    reset,
  };
});
