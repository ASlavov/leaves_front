# Company Documents — Full Implementation Plan

This supersedes the documents section of `new_features_implementation_plan.md`.

---

## Core design decision: target_type enum, never null-as-sentinel

Every document has an explicit `target_type` column:

| `target_type` | `target_user_id` | Meaning |
|---|---|---|
| `'all'` | `null` | Company-wide — every authenticated user can view it |
| `'user'` | FK → users (required) | Personal — only that user + admin + HR can view it |

`null` on `target_user_id` is a mechanical consequence of `target_type = 'all'`, not a business rule. The intent is always encoded in `target_type`. The UI never allows submitting without an explicit selection.

---

## Use cases this covers

| Document example | target_type | Who sees it |
|---|---|---|
| Company holiday policy | all | Everyone |
| Employee handbook | all | Everyone |
| John's employment contract | user → John | John + Admin + HR |
| Jane's payslip | user → Jane | Jane + Admin + HR |
| Performance review | user → employee | That employee + Admin + HR |

---

## Backend (Laravel)

### Step 1 — Migration: `create_company_documents_table`

```
company_documents
  id                bigint PK
  title             string (255)
  description       text, nullable
  source_type       enum('google_doc', 'sharepoint', 'file')   ← renamed from 'type' to avoid SQL keyword collision
  url               string (2048), nullable     — google_doc / sharepoint link
  file_path         string (1024), nullable     — relative path within storage/app/company_documents/
  original_filename string (255), nullable
  mime_type         string (127), nullable
  file_size         bigint, nullable            — bytes
  uploaded_by       FK → users, cascadeOnDelete
  target_type       enum('all', 'user')         — explicit assignment; never null
  target_user_id    FK → users, nullable        — required when target_type = 'user'
  timestamps
```

Indexes:
- `uploaded_by`
- `target_type`
- `target_user_id`
- Composite `(target_type, target_user_id)` — used by the access-filter query

### Step 2 — Model: `CompanyDocument.php`

```php
protected $fillable = [
    'title', 'description', 'source_type',
    'url', 'file_path', 'original_filename', 'mime_type', 'file_size',
    'uploaded_by', 'target_type', 'target_user_id',
];

protected $casts = [
    'file_size' => 'integer',
];

// Relationships
public function uploader(): BelongsTo  // → users (id, name, profile_image via profile)
public function targetUser(): BelongsTo // → users (id, name), nullable
```

### Step 3 — Storage

Dedicated folder: `storage/app/company_documents/`.
Filename strategy: `{uuid}.{ext}` — prevents collisions and path traversal.
`Storage::disk('local')->put("company_documents/{$filename}", base64_decode($fileBase64))`

### Step 4 — Controller: `CompanyDocumentController.php`

#### Access control (applied in every method)

```php
private function scopeForUser(Builder $query, User $user): Builder
{
    // Admin and HR see everything
    if ($user->roles()->whereIn('name', ['admin', 'hr-manager'])->exists()) {
        return $query;
    }
    // Everyone else: company-wide OR explicitly assigned to them
    return $query->where(function ($q) use ($user) {
        $q->where('target_type', 'all')
          ->orWhere(function ($q2) use ($user) {
              $q2->where('target_type', 'user')
                 ->where('target_user_id', $user->id);
          });
    });
}
```

#### Methods

| Method | Route | Auth | Action |
|---|---|---|---|
| `index` | `GET /company-documents` | all authenticated | Scoped query + eager load `uploader` + `targetUser`; supports `?target_user_id=` filter for admin/HR |
| `store` | `POST /company-documents` | admin, hr-manager | Validate, decode Base64 if source_type=file, save to disk, insert record |
| `update` | `PUT /company-documents/{id}` | admin, hr-manager | Update metadata; if new file provided, delete old + save new; can change `target_type`/`target_user_id` |
| `destroy` | `DELETE /company-documents/{id}` | admin, hr-manager | Delete file from disk if source_type=file, delete record |
| `download` | `GET /company-documents/{id}/download` | all authenticated | Scope check first; stream file with correct Content-Type + Content-Disposition headers |

#### Validation rules for `store` / `update`

```
title              required, string, max:255
description        nullable, string
source_type        required, in:google_doc,sharepoint,file
url                required_if:source_type,google_doc
                   required_if:source_type,sharepoint
                   string, url, max:2048
file_base64        required_if:source_type,file (on store; nullable on update = keep existing file)
original_filename  required_if:source_type,file, string, max:255
mime_type          nullable, string, max:127
target_type        required, in:all,user
target_user_id     required_if:target_type,user, integer, exists:users,id
                   prohibited_if:target_type,all   ← enforces no stray values when target_type=all
```

### Step 5 — Routes (`api.php`)

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/company-documents',              [CompanyDocumentController::class, 'index']);
    Route::get('/company-documents/{id}/download',[CompanyDocumentController::class, 'download']);
    Route::post('/company-documents',             [CompanyDocumentController::class, 'store']);
    Route::put('/company-documents/{id}',         [CompanyDocumentController::class, 'update']);
    Route::delete('/company-documents/{id}',      [CompanyDocumentController::class, 'destroy']);
});
```

---

## Frontend (Nuxt)

### Step 6 — Types: `types/document.ts`

```ts
export type DocumentSourceType = 'google_doc' | 'sharepoint' | 'file';
export type DocumentTargetType = 'all' | 'user';

export interface DocumentTargetUser {
  id: number;
  name: string;
  profile_image_base64: string | null;
}

export interface CompanyDocument {
  id: number;
  title: string;
  description: string | null;
  source_type: DocumentSourceType;
  url: string | null;
  original_filename: string | null;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: number;
  uploader?: DocumentTargetUser;
  target_type: DocumentTargetType;
  target_user_id: number | null;
  target_user?: DocumentTargetUser | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  source_type: DocumentSourceType;
  url?: string;
  file_base64?: string;
  original_filename?: string;
  mime_type?: string;
  target_type: DocumentTargetType;
  target_user_id?: number | null;
}
```

Export from `types/index.ts`.

### Step 7 — Server API proxy routes

- `server/api/documents/index.get.ts` — proxies GET; forwards optional `?target_user_id=` query param
- `server/api/documents/index.post.ts` — proxies POST
- `server/api/documents/[id].put.ts` — proxies PUT
- `server/api/documents/[id].delete.ts` — proxies DELETE
- `server/api/documents/[id].download.get.ts` — proxies GET download; streams the file with headers intact

All inject token from `event.context`.

### Step 8 — Composable: `composables/documentsApiComposable.ts`

```ts
getDocumentsComposable(targetUserId?: number)       // optional filter for admin/HR
createDocumentComposable(payload: CreateDocumentPayload)
updateDocumentComposable(id: number, payload: Partial<CreateDocumentPayload>)
deleteDocumentComposable(id: number)
getDocumentDownloadUrl(id: number): string          // returns '/api/documents/{id}/download'
```

### Step 9 — Store: `stores/documents.ts`

```ts
// state
documents: Ref<CompanyDocument[]>
loading: Ref<boolean>
error: Ref<string | null>

// computed
companyDocuments: ComputedRef<CompanyDocument[]>
  // → documents filtered to target_type === 'all'

personalDocuments: ComputedRef<CompanyDocument[]>
  // → documents filtered to target_type === 'user'
  // for admin/HR: ALL user-targeted docs
  // for regular users: only their own (server already scoped this)

// actions
fetchDocuments(targetUserId?: number)  // optional: admin/HR filtering by user
createDocument(payload: CreateDocumentPayload)
updateDocument(id: number, payload: Partial<CreateDocumentPayload>)
deleteDocument(id: number)
reset()
```

The store does not need to re-implement access logic — the server scopes `index` correctly. The computed splits are purely for visual grouping on the page.

### Step 10 — Register in `centralStore.ts`

- Import `useDocumentsStore`
- Add `documentsStore.fetchDocuments()` to the second `Promise.all` in `init()`
- Add `documentsStore.reset()` to `logout()`
- Expose as `documentsStore`

---

### Step 11 — Components

#### `components/Documents/DocumentTargetPicker.vue` (new, shared sub-component)

A searchable picker used inside `UploadDocumentModal`. Renders:

```
[ All (Company-wide) ▼ ]     ← default selection, always first
  ────────────────────
  John Smith
  Jane Doe
  ...
```

- Uses `CustomSelect` pattern from the codebase (not a native `<select>`)
- Props: `modelValue: { type: DocumentTargetType; userId: number | null }`, `users: User[]`
- Emits `update:modelValue`
- "All (Company-wide)" maps to `{ type: 'all', userId: null }`
- Selecting a user maps to `{ type: 'user', userId: user.id }`
- There is no way to leave the picker in an unset state — "All" is always the fallback

#### `components/Documents/UploadDocumentModal.vue`

Uses `BaseModal`. Fields:

1. **Source type selector** — 3 pill buttons: "Google Doc" | "SharePoint" | "Upload File"
2. **URL input** (shown for google_doc / sharepoint) — validated on blur
3. **File input** (shown for file):
   - Hidden `<input type="file">`, triggered by styled button
   - Accepted: `.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt`
   - `FileReader.readAsDataURL()` → strip data URI prefix → `file_base64`
   - Shows filename + human-readable file size
4. **Title** — auto-populated from filename when source_type=file, always editable
5. **Description** — optional textarea
6. **Assign To** — `DocumentTargetPicker` component
   - Defaults to "All (Company-wide)" on open
   - When editing an existing document: pre-filled from the document's current target

All inputs use `useFormStyles` classes. Emits `saved(document: CompanyDocument)` on success.

#### `components/Documents/DocumentCard.vue`

Displays:
- **Source icon**: Google Docs color mark / SharePoint color mark / file-type icon by MIME
- **Title** (bold)
- **Description** (1-2 lines truncated, tooltip on hover for full text)
- **Target badge**: pill showing `UserAvatar` + name if `target_type = 'user'`, or a globe/company icon + "Company-wide" if `target_type = 'all'`
- **Uploader** — "Added by [name]" in small text
- **Date** — upload date, relative format
- **File size badge** — only for source_type=file
- **Primary action button**:
  - Google Doc / SharePoint → "Open" → `window.open(url, '_blank')`
  - File → "Download" → navigates to `/api/documents/{id}/download`
- **Admin/HR action menu** (three-dot or icon pair, only visible to admin/hr):
  - Edit → opens `UploadDocumentModal` pre-filled
  - Delete → inline confirmation ("Delete this document?", two buttons: confirm/cancel)

#### `components/Documents/DocumentsList.vue`

The main content component rendered by `pages/documents.vue`.

**Layout — two named sections:**

```
┌─────────────────────────────────────────────────────┐
│  [Upload Document]  [Search...]  [source filter ▼]  │
├─────────────────────────────────────────────────────┤
│  Company Documents                                  │  ← target_type = 'all'
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Card     │ │ Card     │ │ Card     │            │
│  └──────────┘ └──────────┘ └──────────┘            │
├─────────────────────────────────────────────────────┤
│  Personal Documents                                 │  ← target_type = 'user'
│                                                     │
│  [Admin/HR only: filter by user ▼]                  │
│                                                     │
│  ┌──────────┐ ┌──────────┐                          │
│  │ Card     │ │ Card     │                          │
│  └──────────┘ └──────────┘                          │
└─────────────────────────────────────────────────────┘
```

**Toolbar (top):**
- **Upload Document** button (admin/hr only, `can('company_documents', 'modify')`)
- **Search input** — client-side filter on title (applies to both sections)
- **Source filter** — pill buttons: All / Google Docs / SharePoint / Files (applies to both sections)

**Company Documents section:**
- Rendered from `documentsStore.companyDocuments` (filtered by search + source)
- Visible to all roles
- Empty state: "No company-wide documents yet." (admin/HR see upload CTA; others see neutral message)

**Personal Documents section:**
- Only rendered if:
  - User is admin/HR → always shown (they manage everyone's docs)
  - User is regular/head → shown only if they have at least one personal document assigned to them
- **Admin/HR extras**: a user filter dropdown ("Showing documents for: [All users ▼]") — selecting a user calls `documentsStore.fetchDocuments(userId)` to get that user's specific docs. "All users" resets to `fetchDocuments()` (no filter).
- Rendered from `documentsStore.personalDocuments` (filtered by search + source + optional user filter)
- Empty state per-context: "No personal documents for this user." / "You have no personal documents."

**Responsive grid:** 1 col mobile → 2 col tablet → 3 col desktop (same as original plan).

### Step 12 — Page: `pages/documents.vue`

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

### Step 13 — Sidebar: `SidebarMenu.vue`

Two new entries below Calendar (unchanged from original plan):
1. Org Chart — hierarchy SVG icon
2. Documents — document SVG icon

### Step 14 — Permissions

**`stores/permissions.ts`:**

```ts
company_documents: {
  view: ['admin', 'hr-manager', 'head', 'user'],
  // 'view' here means "can access the documents page"
  // row-level access (personal vs company-wide) is enforced server-side
  modify: ['admin', 'hr-manager'],
},
```

**`components/Settings/Permissions.vue`:** Add `company_documents` category row with `view` and `modify` actions.

### Step 15 — i18n (`en.json` / `el.json`)

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
  "sourceTypeGoogleDoc": "Google Doc",
  "sourceTypeSharePoint": "SharePoint",
  "sourceTypeFile": "File Upload",
  "urlLabel": "Document URL",
  "urlPlaceholder": "https://docs.google.com/...",
  "fileLabel": "Select File",
  "titleLabel": "Title",
  "descriptionLabel": "Description (optional)",
  "assignToLabel": "Assign To",
  "targetAll": "All (Company-wide)",
  "targetUser": "Specific Employee",
  "uploadedBy": "Added by",
  "companySection": "Company Documents",
  "personalSection": "Personal Documents",
  "filterByUser": "Filter by employee",
  "allUsers": "All employees",
  "open": "Open",
  "download": "Download",
  "emptyCompany": "No company-wide documents yet.",
  "emptyPersonal": "No personal documents.",
  "emptyPersonalUser": "No personal documents for this employee.",
  "uploadSuccess": "Document uploaded successfully.",
  "uploadFailed": "Failed to upload document.",
  "updateSuccess": "Document updated.",
  "updateFailed": "Failed to update document.",
  "deleteFailed": "Failed to delete document.",
  "fetchFailed": "Failed to load documents.",
  "fileSizeWarning": "Maximum file size: 20 MB"
}
```

Additional keys needed:
- `errors.documents.fetchFailed`, `errors.documents.uploadFailed`, `errors.documents.updateFailed`, `errors.documents.deleteFailed`
- `common.documents` (sidebar label)
- `permissions.companyDocuments.label`, `.view`, `.modify`

Mirror all in `el.json`.

---

## Access matrix summary

| Role | Sees company-wide docs | Sees own personal docs | Sees other users' personal docs | Can upload/edit/delete |
|---|---|---|---|---|
| Admin | ✅ | ✅ | ✅ (all) | ✅ |
| HR Manager | ✅ | ✅ | ✅ (all) | ✅ |
| Head | ✅ | ✅ | ❌ | ❌ |
| User | ✅ | ✅ | ❌ | ❌ |

Server enforces this — no role checks needed in the frontend beyond showing/hiding the Upload button.

---

## Key design decisions

| Decision | Rationale |
|---|---|
| `target_type` enum as the authority | Makes the intent explicit at the DB level; `target_user_id = null` is only mechanical, not a business rule |
| `prohibited_if:target_type,all` on `target_user_id` | Prevents any accidental null-with-user-intent confusion at the API boundary |
| `DocumentTargetPicker` always defaults to "All" | No way for an admin to accidentally save a doc without choosing; "All" is a safe, visible default |
| Two named page sections instead of a single flat list | Personal and company-wide docs serve fundamentally different purposes; mixing them with only a filter would obscure the model |
| Admin/HR user filter hits the server | Personal documents can be numerous for a large org; client-side filtering of all users' docs is not viable |
| `source_type` not `type` | Avoids collision with PHP/SQL reserved words and avoids ambiguity with `target_type` |
| File streaming on download | Files are stored on disk; serving them through a controller stream (not raw Base64 in JSON) is the correct approach for larger files |

---

## Execution order

```
Phase 1 — Backend
  Migration: create_company_documents_table (with target_type + target_user_id)
  Model: CompanyDocument.php
  Storage folder setup
  Controller: CompanyDocumentController.php (all 5 methods + scopeForUser helper)
  Routes

Phase 2 — Frontend types + server proxies
  types/document.ts
  server/api/documents/* (5 proxy routes)

Phase 3 — Composable + Store
  composables/documentsApiComposable.ts
  stores/documents.ts (with companyDocuments + personalDocuments computeds)
  Register in centralStore.ts

Phase 4 — Components
  DocumentTargetPicker.vue
  UploadDocumentModal.vue (with Assign To field)
  DocumentCard.vue (with target badge)
  DocumentsList.vue (two-section layout + admin user filter)

Phase 5 — Page + Sidebar + Permissions + i18n

Phase 6 — QA
  Access control: regular user cannot see another user's personal docs
  Access control: download endpoint enforces same scope as index
  target_type = 'all' never has a non-null target_user_id in the DB
  Dark mode, mobile layout
  ESLint pass
```
