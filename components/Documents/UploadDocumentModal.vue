<template>
  <BaseModal
    v-model="isOpen"
    :title="documentToEdit ? $t('documents.edit') : $t('documents.upload')"
  >
    <form class="p-4 sm:p-6 space-y-5" @submit.prevent="save">
      <!-- Type Selector tabs -->
      <div class="flex p-1 bg-gray-100 dark:bg-neutral-800 rounded-lg">
        <button
          v-for="docType in types"
          :key="docType.value"
          type="button"
          :class="[
            'flex-1 py-2 text-sm font-medium rounded-md transition-shadow',
            sourceType === docType.value
              ? 'bg-white dark:bg-neutral-700 shadow text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
          @click="sourceType = docType.value"
        >
          {{ $t(docType.labelKey) }}
        </button>
      </div>

      <!-- File Input (if source_type === 'file') -->
      <div v-if="sourceType === 'file'" class="space-y-2">
        <label :class="styles.label">{{ $t('documents.fileLabel') }}</label>
        <div
          class="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition cursor-pointer"
          @click="fileInput?.click()"
        >
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            @change="handleFileChange"
          />
          <div v-if="!selectedFile" class="text-gray-500">
            <div class="text-3xl mb-2">📁</div>
            <p>Click to select file</p>
            <p class="text-xs mt-1">{{ $t('documents.fileSizeWarning') }}</p>
          </div>
          <div v-else class="text-gray-800 dark:text-gray-200">
            <div class="font-medium break-all">{{ selectedFile.name }}</div>
            <div class="text-sm text-gray-500">{{ formatBytes(selectedFile.size) }}</div>
          </div>
        </div>
      </div>

      <!-- URL Input -->
      <div v-else class="space-y-2">
        <label :class="styles.label">{{ $t('documents.urlLabel') }}</label>
        <input
          v-model="url"
          type="url"
          required
          :placeholder="$t('documents.urlPlaceholder')"
          :class="styles.input"
        />
      </div>

      <!-- Title Input -->
      <div class="space-y-2">
        <label :class="styles.label">{{ $t('documents.titleLabel') }}</label>
        <input v-model="title" type="text" required :class="styles.input" />
      </div>

      <!-- Description Input -->
      <div class="space-y-2">
        <label :class="styles.label">{{ $t('documents.descriptionLabel') }}</label>
        <textarea v-model="description" rows="3" :class="styles.input"></textarea>
      </div>

      <!-- Assign To picker -->
      <CustomSelect
        v-model="targetSelection"
        :options="targetOptions"
        :label="$t('documents.assignToLabel')"
      />

      <!-- Submit -->
      <div class="pt-2 flex justify-end">
        <button
          type="submit"
          :disabled="isSaving"
          :class="[
            styles.submitBtn,
            'min-w-[120px]',
            isSaving ? 'opacity-50 cursor-not-allowed' : '',
          ]"
        >
          <svg
            v-if="isSaving"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ documentToEdit ? $t('documents.edit') : $t('documents.upload') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '~/components/shared/BaseModal.vue';
import CustomSelect from '~/components/misc/CustomSelect.vue';
import { useFormStyles } from '~/composables/useFormStyles';
import { useCentralStore } from '~/stores/centralStore';
import type { CompanyDocument, DocumentSourceType } from '~/types';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  documentToEdit: { type: Object as () => CompanyDocument | null, default: null },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const { t } = useI18n();
const styles = useFormStyles();
const centralStore = useCentralStore();
const usersStore = centralStore.userStore;

const sourceType = ref<DocumentSourceType>('google_doc');
const title = ref('');
const description = ref('');
const url = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const fileBase64 = ref('');
const isSaving = ref(false);
const targetSelection = ref<string>('all');

const usersArray = computed(() => usersStore.allUsers || []);

const targetOptions = computed(() => {
  return [
    { id: 'all', name: t('documents.targetAll') },
    ...usersArray.value.map((u: any) => ({ id: String(u.id), name: u.name })),
  ];
});

const types: { value: DocumentSourceType; labelKey: string }[] = [
  { value: 'google_doc', labelKey: 'documents.typeGoogleDoc' },
  { value: 'sharepoint', labelKey: 'documents.typeSharePoint' },
  { value: 'file', labelKey: 'documents.typeFile' },
];

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.documentToEdit) {
        const d = props.documentToEdit;
        sourceType.value = d.source_type;
        title.value = d.title;
        description.value = d.description || '';
        url.value = d.url || '';
        targetSelection.value =
          d.target_type === 'user' && d.target_user_id ? String(d.target_user_id) : 'all';
        selectedFile.value = null;
        fileBase64.value = '';
      } else {
        sourceType.value = 'google_doc';
        title.value = '';
        description.value = '';
        url.value = '';
        targetSelection.value = 'all';
        selectedFile.value = null;
        fileBase64.value = '';
      }

      if (!usersArray.value.length) {
        usersStore.getAllUsers();
      }
    }
  },
  { immediate: true },
);

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    // 20mb limit check
    if (file.size > 20 * 1024 * 1024) {
      (useNuxtApp() as any).$toast?.error(t('documents.fileSizeWarning'));
      return;
    }
    selectedFile.value = file;
    if (!title.value) {
      title.value = file.name;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      const base64Content = result.split(',')[1];
      fileBase64.value = base64Content;
    };
    reader.readAsDataURL(file);
  }
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const save = async () => {
  if (sourceType.value === 'file' && !props.documentToEdit && !fileBase64.value) {
    return; // File is required for new file uploads
  }

  isSaving.value = true;
  try {
    const payload: any = {
      title: title.value,
      description: description.value,
      source_type: sourceType.value,
      target_type: targetSelection.value === 'all' ? 'all' : 'user',
      target_user_id: targetSelection.value === 'all' ? null : Number(targetSelection.value),
    };

    if (sourceType.value === 'file') {
      if (fileBase64.value) {
        payload.file_base64 = fileBase64.value;
        payload.original_filename = selectedFile.value?.name;
        payload.mime_type = selectedFile.value?.type;
      }
    } else {
      payload.url = url.value;
    }

    if (props.documentToEdit) {
      await centralStore.documentsStore.updateDocument(props.documentToEdit.id, payload);
    } else {
      await centralStore.documentsStore.createDocument(payload);
    }
    (useNuxtApp() as any).$toast?.success(t('documents.uploadSuccess'));
    emit('saved');
    isOpen.value = false;
  } catch (e) {
    // Error handled in store
  } finally {
    isSaving.value = false;
  }
};
</script>
