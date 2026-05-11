<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <!-- Search & Filters -->
      <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-3 flex-grow">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('documents.searchPlaceholder')"
          :class="styles.input"
          class="max-w-md"
        />
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="filter in filters"
            :key="filter.value"
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition',
              activeFilter === filter.value
                ? 'bg-[#EA021A] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700',
            ]"
            @click="activeFilter = filter.value"
          >
            {{ $t(filter.labelKey) }}
          </button>
        </div>
      </div>

      <!-- Upload Btn -->
      <button
        v-if="permissionsStore.can('company_documents', 'modify')"
        class="inline-flex justify-center rounded-[70px] border shrink-0 border-transparent bg-[#EA021A] py-[15px] px-[20px] text-[14px] font-medium text-white shadow-sm hover:bg-[#EA021A]/80 focus:outline-none"
        @click="openModal()"
      >
        + {{ $t('documents.upload') }}
      </button>
    </div>

    <!-- Content Sections -->
    <div class="space-y-10">
      <!-- Section 1: Company Documents -->
      <section>
        <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {{ $t('documents.companySection') }}
        </h4>

        <div
          v-if="documentsStore.loading && !isFilteringUser"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="h-48 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"
          ></div>
        </div>

        <div
          v-else-if="companyFilteredDocs.length === 0"
          class="py-8 bg-white dark:bg-neutral-800 rounded-lg border border-gray-100 dark:border-neutral-700 text-center"
        >
          <p class="text-gray-500 dark:text-gray-400">{{ $t('documents.emptyCompany') }}</p>
        </div>

        <div v-else class="flex flex-wrap gap-4">
          <DocumentCard
            v-for="doc in companyFilteredDocs"
            :key="doc.id"
            :document="doc"
            @edit="openModal(doc)"
            @delete="deleteDocument"
          />
        </div>
      </section>

      <!-- Section 2: Personal Documents -->
      <section v-if="showPersonalSection">
        <div
          class="flex justify-between items-center mb-4 border-t border-gray-200 dark:border-neutral-700 pt-8"
        >
          <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {{ $t('documents.personalSection') }}
          </h4>

          <!-- Admin User Filter -->
          <div v-if="canModify" class="flex items-center gap-2 z-20">
            <span class="text-sm text-gray-500 hidden sm:inline whitespace-nowrap"
              >{{ $t('documents.filterByUser') }}:</span
            >
            <div class="w-full min-w-[250px] relative">
              <CustomSelect
                v-model="adminUserFilterString"
                :options="adminFilterOptions"
                :placeholder="$t('documents.allUsers')"
              />
            </div>
          </div>
        </div>

        <div
          v-if="documentsStore.loading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="h-48 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"
          ></div>
        </div>

        <div
          v-else-if="personalFilteredDocs.length === 0"
          class="py-8 bg-white dark:bg-neutral-800 rounded-lg border border-gray-100 dark:border-neutral-700 text-center"
        >
          <p class="text-gray-500 dark:text-gray-400">
            {{
              canModify && adminUserFilterString !== 'all'
                ? $t('documents.emptyPersonalUser')
                : $t('documents.emptyPersonal')
            }}
          </p>
        </div>

        <div v-else class="flex flex-wrap gap-4">
          <DocumentCard
            v-for="doc in personalFilteredDocs"
            :key="doc.id"
            :document="doc"
            @edit="openModal(doc)"
            @delete="deleteDocument"
          />
        </div>
      </section>
    </div>

    <!-- Modal -->
    <UploadDocumentModal
      v-if="isModalOpen"
      v-model="isModalOpen"
      :document-to-edit="editingDoc"
      @saved="onDocumentSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '~/stores/centralStore';
import { useFormStyles } from '~/composables/useFormStyles';
import DocumentCard from './DocumentCard.vue';
import UploadDocumentModal from './UploadDocumentModal.vue';
import CustomSelect from '~/components/misc/CustomSelect.vue';
import type { CompanyDocument, DocumentSourceType } from '~/types';

const { t } = useI18n();
const centralStore = useCentralStore();
const documentsStore = centralStore.documentsStore;
const permissionsStore = centralStore.permissionsStore;
const usersStore = centralStore.userStore;
const styles = useFormStyles();

const searchQuery = ref('');
const activeFilter = ref<'all' | DocumentSourceType>('all');
const isModalOpen = ref(false);
const editingDoc = ref<CompanyDocument | null>(null);
const adminUserFilterString = ref<string>('all');
const isFilteringUser = ref(false);

const canModify = computed(() => permissionsStore.can('company_documents', 'modify'));

const usersArray = computed(() => usersStore.allUsers || []);

const adminFilterOptions = computed(() => {
  return [
    { id: 'all', name: t('documents.allUsers') },
    ...usersArray.value.map((u: any) => ({ id: String(u.id), name: u.name })),
  ];
});

const showPersonalSection = computed(() => {
  if (canModify.value) return true;
  return personalFilteredDocs.value.length > 0;
});

const filters = [
  { value: 'all', labelKey: 'documents.filterAll' },
  { value: 'google_doc', labelKey: 'documents.filterGoogleDoc' },
  { value: 'sharepoint', labelKey: 'documents.filterSharePoint' },
  { value: 'file', labelKey: 'documents.filterFile' },
] as const;

watch(adminUserFilterString, async (val) => {
  isFilteringUser.value = true;
  const userId = val === 'all' ? undefined : Number(val);
  await documentsStore.fetchDocuments(userId);
  isFilteringUser.value = false;
});

onMounted(() => {
  documentsStore.fetchDocuments();
  if (canModify.value && !usersArray.value.length) {
    usersStore.getAllUsers();
  }
});

const filterDocsList = (docs: CompanyDocument[]) => {
  let list = [...docs];
  if (activeFilter.value !== 'all') {
    list = list.filter((d: any) => d.source_type === activeFilter.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (d: any) => d.title.toLowerCase().includes(q) || d.uploader?.name?.toLowerCase().includes(q),
    );
  }
  return list;
};

const companyFilteredDocs = computed(() => filterDocsList(documentsStore.companyDocuments || []));
const personalFilteredDocs = computed(() => filterDocsList(documentsStore.personalDocuments || []));

const openModal = (doc: CompanyDocument | null = null) => {
  editingDoc.value = doc;
  isModalOpen.value = true;
};

const onDocumentSaved = () => {
  isModalOpen.value = false;
};

const deleteDocument = async (id: number) => {
  try {
    await documentsStore.deleteDocument(id);
  } catch (e) {
    // Handled in store
  }
};
</script>
