import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  fetchDocumentSourcesComposable,
  updateDocumentSourcesComposable,
} from '@/composables/settingsApiComposable';
import { useNuxtApp } from '#app';

export const useSettingsStore = defineStore('settings', () => {
  const documentSources = ref({
    doc_source_google: true,
    doc_source_sharepoint: true,
    doc_source_file: true,
  });
  const loading = ref(false);
  const loaded = ref(false);

  function reset() {
    documentSources.value = {
      doc_source_google: true,
      doc_source_sharepoint: true,
      doc_source_file: true,
    };
    loaded.value = false;
  }

  async function fetchDocumentSources() {
    if (loaded.value) return;
    try {
      loading.value = true;
      const result: any = await fetchDocumentSourcesComposable();
      if (result) {
        documentSources.value = result;
        loaded.value = true;
      }
    } catch (e) {
      console.error('Error fetching document sources:', e);
    } finally {
      loading.value = false;
    }
  }

  async function updateDocumentSources(payload: {
    doc_source_google: boolean;
    doc_source_sharepoint: boolean;
    doc_source_file: boolean;
  }) {
    const { $toast } = useNuxtApp() as any;
    try {
      loading.value = true;
      const result: any = await updateDocumentSourcesComposable(payload);
      if (result) {
        documentSources.value = result;
        $toast?.success('Document sources updated');
      }
    } catch (e) {
      console.error('Error updating document sources:', e);
      $toast?.error('Failed to update document sources');
    } finally {
      loading.value = false;
    }
  }

  return {
    documentSources,
    loading,
    reset,
    fetchDocumentSources,
    updateDocumentSources,
  };
});
