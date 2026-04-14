# New Features Implementation Plan

## Conventions (everything below follows these)
- Proxy pattern: Component → Store → Composable → `server/api/` → Laravel
- `useCentralStore()` for all data access; stores registered in `centralStore.ts`
- All strings via i18n (`en.json` + `el.json`)
- `BaseModal.vue` + `UserAvatar.vue` from `components/shared/`
- No multipart — file uploads as Base64 in JSON body
- `useFormStyles.ts` for form token classes
- Permission `can(category, action)` via `permissionsStore`
- Store error pattern: `useI18n` + `setError` + `catch → setError → rethrow`

---

## Feature 1 — Organizational Chart

### Backend (Laravel)

#### Step 1 — Migration: `create_org_chart_nodes_table`
```
org_chart_nodes
  id              bigint PK
  user_id         FK → users (nullable — future-proofing placeholder nodes)
  parent_id       FK → org_chart_nodes (nullable = root)
  position        integer  (sibling order, 0-based)
  timestamps
```
Index on `parent_id` for tree queries.

#### Step 2 — Model: `OrgChartNode.php`
- `$fillable`: `user_id`, `parent_id`, `position`
- Relationships: `parent()` BelongsTo self, `children()` HasMany self ordered by `position`, `user()` BelongsTo User (with select `id, name, job_title, profile_image`)

#### Step 3 — Controller: `OrgChartController.php`
| Method | Route | Auth | Action |
|---|---|---|---|
| `index` | `GET /org-chart` | all authenticated | Return all nodes with `user` eager-loaded, as a flat list (frontend builds tree) |
| `sync` | `POST /org-chart` | admin only | Delete all rows, bulk insert the incoming flat array `[{user_id, parent_id, position}]`, return fresh nodes |

`sync` runs inside a DB transaction. The "delete all + reinsert" pattern keeps it simple and correct for a tree that can be fully replaced — this is standard for small org charts.

#### Step 4 — Routes (`api.php`)
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/org-chart', [OrgChartController::class, 'index']);
    Route::post('/org-chart', [OrgChartController::class, 'sync']); // middleware checks admin role
});
```

---

### Frontend (Nuxt)

#### Step 5 — Types: `types/orgChart.ts`
```ts
export interface OrgChartNode {
  id: number;
  user_id: number;
  parent_id: number | null;
  position: number;
  user?: {
    id: number;
    name: string;
    job_title: string | null;
    profile_image: string | null;
  };
}

export interface OrgChartTreeNode extends OrgChartNode {
  children: OrgChartTreeNode[];
}

export interface OrgChartSyncPayload {
  nodes: Array<{ user_id: number; parent_id: number | null; position: number }>;
}
```
Export from `types/index.ts`.

#### Step 6 — Server API proxy routes
- `server/api/org-chart/index.get.ts` — proxies `GET /org-chart`
- `server/api/org-chart/index.post.ts` — proxies `POST /org-chart`, injects token from context

#### Step 7 — Composable: `composables/orgChartApiComposable.ts`
- `getOrgChartComposable()` — GET via retryFetch
- `syncOrgChartComposable(payload)` — POST via retryFetch

#### Step 8 — Store: `stores/orgChart.ts`
```ts
// state
nodes: Ref<OrgChartNode[]>
loading: Ref<boolean>
error: Ref<string | null>

// computed
tree: ComputedRef<OrgChartTreeNode[]>  // builds nested tree from flat nodes

// actions
fetchOrgChart()
saveOrgChart(nodes: OrgChartSyncPayload['nodes'])
reset()
```
The `tree` computed converts the flat array → nested structure by mapping `parent_id` references, sorting children by `position`.

#### Step 9 — Register in `centralStore.ts`
- Import `useOrgChartStore`
- Add to `Promise.all` in `init()` → `orgChartStore.fetchOrgChart()`
- Add to `logout()` → `orgChartStore.reset()`
- Expose as `orgChartStore` (with proxy)

#### Step 10 — Components

**`components/OrgChart/OrgChartNode.vue`** — recursive, self-referencing
- Props: `node: OrgChartTreeNode`, `editMode: boolean`, `depth: number`
- Shows: `UserAvatar` + name + job title
- Edit mode controls (per node):
  - "Add child" button (opens user picker)
  - "Add sibling" button (emits to parent)
  - "Remove" button (with confirmation)
  - Up/Down arrows to reorder siblings
- Renders `OrgChartNode` recursively for each `node.children`
- Connector lines drawn with CSS `::before/::after` pseudo-elements (no external lib)

**`components/OrgChart/OrgChartUserPicker.vue`** — modal using `BaseModal`
- Searchable list of all users (from `userStore.users`)
- Filters out already-placed users
- Emits `select(userId)`

**`components/OrgChart/OrgChartPage.vue`** — the main page component
- View mode: renders `OrgChartNode` tree, horizontally centered, horizontally scrollable on mobile
- Edit mode (admin only): same render + edit controls visible + pending changes tracked locally
- Toolbar: "Edit" / "Save" / "Cancel" buttons (Save calls `saveOrgChart` with the current flat representation)
- "Add root-level person" button (places at top with `parent_id: null`) — allows multiple root nodes (siblings at the top = co-CEOs etc.)
- Unsaved changes guard: shows warning banner before leaving page

#### Step 11 — Page: `pages/org-chart.vue`
```vue
<template>
  <Sidebar />
  <div class="w-full lg:ps-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh-64 duration-300">
    <OrgChartPage />
  </div>
</template>
```

#### Step 12 — Sidebar: `components/SidebarTopbar/SidebarMenu.vue`
Add a new `<li>` below the Calendar entry with an org-chart SVG icon and `$t('common.orgChart')`.

#### Step 13 — Permissions

**`stores/permissions.ts`** — add:
```ts
org_chart: {
  view: ['admin', 'hr-manager', 'head', 'user'],
  modify: ['admin'],
},
```

**`components/Settings/Permissions.vue`** — add `org_chart` to the `permissionCategories` definition (same pattern as existing rows), with actions `view` and `modify`.

#### Step 14 — i18n (`en.json` / `el.json`)
```json
"orgChart": {
  "title": "Organizational Chart",
  "editMode": "Edit Chart",
  "saveChart": "Save Chart",
  "cancelEdit": "Cancel",
  "addRoot": "Add Top-Level Person",
  "addChild": "Add Direct Report",
  "addSibling": "Add Peer",
  "removePerson": "Remove",
  "removeConfirm": "Remove this person from the org chart?",
  "unsavedChanges": "You have unsaved changes.",
  "saveSuccess": "Org chart saved.",
  "saveFailed": "Failed to save org chart.",
  "fetchFailed": "Failed to load org chart.",
  "pickUser": "Select a person",
  "searchUsers": "Search...",
  "noUsers": "No users available",
  "empty": "The org chart is empty. Add someone to get started."
}
// + errors.orgChart.fetchFailed, errors.orgChart.saveFailed
// + common.orgChart (sidebar label)
// + permissions.orgChart.label, permissions.orgChart.view, permissions.orgChart.modify
```
Mirror all keys in `el.json`.

---

## Feature 2 — Company Documents

### Backend (Laravel)

#### Step 1 — Migration: `create_company_documents_table`
```
company_documents
  id                bigint PK
  title             string (255)
  description       text, nullable
  type              enum('google_doc', 'sharepoint', 'file')
  url               string (2048), nullable   — for google_doc / sharepoint
  file_path         string (1024), nullable   — relative path within company_documents/
  original_filename string (255), nullable
  mime_type         string (127), nullable
  file_size         bigint, nullable           — bytes
  uploaded_by       FK → users
  timestamps
```
Index on `uploaded_by`, index on `type`.

#### Step 2 — Model: `CompanyDocument.php`
- `$fillable`: all columns above
- `$casts`: `file_size` → integer
- `uploader()` BelongsTo User (select `id, name, profile_image`)

#### Step 3 — Storage
Dedicated sub-folder: `storage/app/company_documents/`. Use `Storage::disk('local')->put("company_documents/{$filename}", $decoded)`.

Filename strategy: `{uuid}.{ext}` to avoid collisions and prevent path traversal.

#### Step 4 — Controller: `CompanyDocumentController.php`
| Method | Route | Auth | Action |
|---|---|---|---|
| `index` | `GET /company-documents` | all authenticated | Return all with `uploader` eager-loaded |
| `store` | `POST /company-documents` | admin, hr-manager | Validate, decode Base64 if type=file, save, return record |
| `update` | `PUT /company-documents/{id}` | admin, hr-manager | Update title/description/url; if new file provided, delete old + save new |
| `destroy` | `DELETE /company-documents/{id}` | admin, hr-manager | Delete file from disk if type=file, delete record |
| `download` | `GET /company-documents/{id}/download` | all authenticated | Stream file with correct Content-Type + Content-Disposition |

Validation rules for `store`:
- `title`: required, string, max:255
- `description`: nullable, string
- `type`: required, in:google_doc,sharepoint,file
- `url`: required_if:type,google_doc | required_if:type,sharepoint — string, url, max:2048
- `file_base64`: required_if:type,file — string
- `original_filename`: required_if:type,file — string, max:255
- `mime_type`: nullable, string, max:127

#### Step 5 — Routes (`api.php`)
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/company-documents', [CompanyDocumentController::class, 'index']);
    Route::get('/company-documents/{id}/download', [CompanyDocumentController::class, 'download']);
    Route::post('/company-documents', [CompanyDocumentController::class, 'store']);
    Route::put('/company-documents/{id}', [CompanyDocumentController::class, 'update']);
    Route::delete('/company-documents/{id}', [CompanyDocumentController::class, 'destroy']);
});
```

---

### Frontend (Nuxt)

#### Step 6 — Types: `types/document.ts`
```ts
export type DocumentType = 'google_doc' | 'sharepoint' | 'file';

export interface CompanyDocument {
  id: number;
  title: string;
  description: string | null;
  type: DocumentType;
  url: string | null;
  original_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: number;
  uploader?: { id: number; name: string; profile_image: string | null };
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  type: DocumentType;
  url?: string;
  file_base64?: string;
  original_filename?: string;
  mime_type?: string;
}
```
Export from `types/index.ts`.

#### Step 7 — Server API proxy routes
- `server/api/documents/index.get.ts` — proxies GET
- `server/api/documents/index.post.ts` — proxies POST
- `server/api/documents/[id].put.ts` — proxies PUT
- `server/api/documents/[id].delete.ts` — proxies DELETE
- `server/api/documents/[id].download.get.ts` — proxies GET download, forwards the raw stream with correct headers

#### Step 8 — Composable: `composables/documentsApiComposable.ts`
- `getDocumentsComposable()`
- `createDocumentComposable(payload)`
- `updateDocumentComposable(id, payload)`
- `deleteDocumentComposable(id)`
- `getDocumentDownloadUrl(id)` — returns the Nuxt proxy URL (used for `<a href>` or `window.open`)

#### Step 9 — Store: `stores/documents.ts`
```ts
// state
documents: Ref<CompanyDocument[]>
loading: Ref<boolean>
error: Ref<string | null>

// actions
fetchDocuments()
createDocument(payload: CreateDocumentPayload)
updateDocument(id: number, payload: Partial<CreateDocumentPayload>)
deleteDocument(id: number)
reset()
```

#### Step 10 — Register in `centralStore.ts`
- Import `useDocumentsStore`
- Add `documentsStore.fetchDocuments()` to `Promise.all` in `init()`
- Add `documentsStore.reset()` to `logout()`
- Expose as `documentsStore`

#### Step 11 — Components

**`components/Documents/UploadDocumentModal.vue`** — uses `BaseModal`
- Type selector: 3 pill/tab buttons — "Google Doc", "SharePoint", "Upload File"
- Google Doc / SharePoint: URL input field (validated on blur)
- File upload:
  - `<input type="file">` (hidden, triggered by styled button)
  - Accepted: `application/pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt`
  - On select: `FileReader.readAsDataURL()` → strip data URI prefix → send as `file_base64`
  - Shows filename + file size preview
- Title (auto-populated from filename if type=file, editable)
- Description (optional textarea)
- Uses `useFormStyles` for input classes
- Emits `saved` on success

**`components/Documents/DocumentCard.vue`**
- Icon by type: Google Docs color, SharePoint color, file-type icon by MIME
- Title, description (truncated), uploader name, upload date
- File size badge (if type=file)
- Actions (admin/hr only): Edit (opens modal pre-filled), Delete (confirm dialog inline)
- Primary action for all users:
  - Google Doc / SharePoint: "Open" button → `window.open(url, '_blank')`
  - File: "Download" button → navigates to `/api/documents/{id}/download`

**`components/Documents/DocumentsList.vue`**
- Search input (filter by title/uploader client-side)
- Filter pills: All / Google Doc / SharePoint / Files
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- Empty state with message
- "Upload Document" button (admin/hr only via `can('company_documents', 'modify')`) → opens `UploadDocumentModal`

#### Step 12 — Page: `pages/documents.vue`
```vue
<template>
  <Sidebar />
  <div class="w-full lg:ps-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh-64 duration-300">
    <h3 class="px-4 pt-9 sm:px-6 font-semibold text-lg dark:text-gray-100">
      {{ $t('documents.title') }}
    </h3>
    <div class="p-4 sm:p-6">
      <DocumentsList />
    </div>
  </div>
</template>
```

#### Step 13 — Sidebar: `SidebarMenu.vue`
Add two entries below Calendar:
1. Org Chart — hierarchy/tree SVG icon + `$t('common.orgChart')`
2. Documents — document/folder SVG icon + `$t('common.documents')`

#### Step 14 — Permissions

**`stores/permissions.ts`** — add:
```ts
company_documents: {
  view: ['admin', 'hr-manager', 'head', 'user'],
  modify: ['admin', 'hr-manager'],
},
```

**`components/Settings/Permissions.vue`** — add `company_documents` category row (same pattern as `invitations`).

#### Step 15 — i18n (`en.json` / `el.json`)
```json
"documents": {
  "title": "Company Documents",
  "upload": "Upload Document",
  "edit": "Edit Document",
  "deleteConfirm": "Delete this document? This cannot be undone.",
  "searchPlaceholder": "Search documents...",
  "filterAll": "All",
  "filterGoogleDoc": "Google Docs",
  "filterSharePoint": "SharePoint",
  "filterFile": "Files",
  "typeGoogleDoc": "Google Doc",
  "typeSharePoint": "SharePoint",
  "typeFile": "File Upload",
  "urlLabel": "Document URL",
  "urlPlaceholder": "https://docs.google.com/...",
  "fileLabel": "Select File",
  "titleLabel": "Title",
  "descriptionLabel": "Description (optional)",
  "uploadedBy": "Uploaded by",
  "open": "Open",
  "download": "Download",
  "empty": "No documents yet.",
  "uploadSuccess": "Document uploaded.",
  "uploadFailed": "Upload failed.",
  "deleteFailed": "Failed to delete document.",
  "fetchFailed": "Failed to load documents.",
  "fileSizeWarning": "File size limit: 20 MB"
}
// + errors.documents.*
// + common.documents (sidebar label)
// + permissions.companyDocuments.label, .view, .modify
```
Mirror all keys in `el.json`.

---

## Execution Order

```
Phase 1 — Backend (both features in parallel)
  1a. Org chart: migration + model + controller + routes
  1b. Documents: migration + model + controller + storage + routes

Phase 2 — Frontend types + server proxies (parallel)
  2a. types/orgChart.ts + server/api/org-chart/*
  2b. types/document.ts + server/api/documents/*

Phase 3 — Composables + Stores (parallel)
  3a. orgChartApiComposable + stores/orgChart.ts
  3b. documentsApiComposable + stores/documents.ts

Phase 4 — Register both stores in centralStore.ts

Phase 5 — Components (parallel within each feature)
  5a. OrgChartNode + OrgChartUserPicker + OrgChartPage
  5b. DocumentCard + UploadDocumentModal + DocumentsList

Phase 6 — Pages + Sidebar + Permissions rows + i18n (parallel)

Phase 7 — QA: permissions gating, dark mode, mobile layout, i18n completeness, ESLint pass
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Org chart stored as flat list of nodes | Simple to transport over JSON, rebuild tree client-side in a `computed` — avoids deep nested PUT payloads |
| Full replace (`POST /org-chart` deletes all + reinserts) | Org charts change infrequently; no complex patch diffing needed; atomic via DB transaction |
| Multiple root-level nodes allowed (`parent_id: null`) | Supports co-CEO structures and sibling-at-top scenarios explicitly requested |
| File uploads as Base64 | Consistent with project convention (leave attachments). 20 MB limit recommended; note in UI |
| Separate `download` endpoint for files | Avoids serving raw Base64 back to frontend; streams with correct Content-Type headers |
| Document type as enum with 3 values | Clean separation of link-based vs file-based docs; extensible (e.g., Notion later) |
| `OrgChartNode` recursive component | Handles arbitrary depth without special-casing; depth prop for visual indentation control |
| No drag-and-drop library | Keeps zero new dependencies; up/down buttons + "add child/sibling" cover all admin operations cleanly |
