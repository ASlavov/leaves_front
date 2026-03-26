# User Creation Rectification Plan

## Confirmed Bug

`newUser()` in `UsersList.vue:386` sets `selectedUserId = null` and opens the `EditUser` component
with `:userId="null"`. `EditUser.vue:submitForm()` always calls `userStore.editUser(userId, ...)`
regardless of mode. `userId` is `null`, so the request hits `PUT /api/user-update` with
`user_id: null`. The backend's `user_update()` validates `user_id` as `required|exists:users,id`
— null fails, returns 422, Nuxt server route re-throws as 500.

The correct backend endpoint for creation already exists: `POST /api/users` → `UserController::store()`.
It is complete and correct. No structural backend changes are needed.

---

## Backend Assessment

`UserController::store()` correctly:
- Validates required fields: `name`, `email` (unique), `department_id`, `password`, `role_id`
- Validates optional fields: `phone`, `internal_phone`, `job_title`, `job_description`
- Creates the user with bcrypt password
- Attaches the role via `$user->roles()->attach($request->role_id)`
- Saves base64 profile image and creates the `UserProfile` record

**One backend change required** (minimal, one line):

In `store()`, `profile_image` is `'required'` in the validator, but the save logic is already
wrapped in `if ($request->has('profile_image') && $request->profile_image)`. The validator
contradicts the implementation. Change the rule to `'nullable'` to allow creation without a
profile photo. The avatar initials fallback already exists in the frontend.

```php
// In UserController::store() validator — change this line:
'profile_image' => 'required',
// To:
'profile_image' => 'nullable',
```

> **Note for backend:** This is a single-line change in
> `app/Http/Controllers/Api/UserController.php` inside the `store()` method's validator array.
> No other backend changes are needed.

---

## Frontend Changes (5 files)

### Step 1 — Add `AddUserPayload` type
**File:** `types/index.ts`

Add after the `EditUserPayload` interface:

```ts
export interface AddUserPayload {
    userName: string;
    userEmail: string;
    userDepartment: string | number;
    userRole: string | number;
    userPassword: string;
    userPhone?: string;
    userInternalPhone?: string;
    userTitle?: string;
    userTitleDescription?: string;
    userImage?: string;
}
```

---

### Step 2 — Add `addUserComposable`
**File:** `composables/userApiComposable.ts`

Add this export alongside the existing ones:

```ts
export const addUserComposable = async (body: AddUserPayload) => {
    return retryFetch('/api/user/addUser', {
        method: 'POST',
        body: { ...body },
    });
}
```

Import `AddUserPayload` in the import line at the top of the file.

---

### Step 3 — Create the server route
**File:** `server/api/user/addUser.ts` *(new file)*

Mirrors `editUser.ts` but uses `POST /users` and maps the creation fields:

```ts
import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { token } = event.context;

    try {
        const {
            userName,
            userEmail,
            userDepartment,
            userRole,
            userPassword,
            userPhone,
            userInternalPhone,
            userTitle,
            userTitleDescription,
            userImage,
        } = body;

        const response = await $fetch(`${config.public.apiBase}/users`, {
            method: 'POST',
            body: {
                name: userName,
                email: userEmail,
                department_id: userDepartment,
                role_id: userRole,
                password: userPassword,
                phone: userPhone,
                internal_phone: userInternalPhone,
                job_title: userTitle,
                job_description: userTitleDescription,
                profile_image: userImage,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response;
    } catch (error: any) {
        console.error('Error creating user:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error creating user',
        });
    }
});
```

> **Note on the API base path:** Check `config.public.user.edit` in `editUser.ts` to confirm
> whether the existing config key points to a full path or just the suffix. The `/users` path
> above should match the same base + suffix pattern used by the other routes in your
> `runtimeConfig`. Adjust accordingly if a dedicated config key exists.

---

### Step 4 — Add `addUser` action to the store
**File:** `stores/user.ts`

1. Import `addUserComposable` and `AddUserPayload` at the top alongside the existing imports.

2. Add the `addUser` function inside the store:

```ts
async function addUser(
    userName: string,
    userEmail: string,
    userDepartment: string | number,
    userRole: string | number,
    userPassword: string,
    userPhone: string,
    userInternalPhone: string,
    userTitle: string,
    userTitleDescription: string,
    userImage: string
) {
    try {
        loading.value = true;
        const result = await addUserComposable({
            userName,
            userEmail,
            userDepartment,
            userRole,
            userPassword,
            userPhone,
            userInternalPhone,
            userTitle,
            userTitleDescription,
            userImage,
        });

        if (result?.errors) {
            throw new Error();
        }

        await getAllUsers();
        try { await departmentsStore.getAll(); } catch (e) { console.error('Failed to refresh departments', e); }
    } catch (err) {
        setError(t('errors.user.editFailed'));
        throw err;
    } finally {
        loading.value = false;
    }
}
```

3. Expose `addUser` in the return object.

---

### Step 5 — Update `EditUser.vue` to handle creation mode
**File:** `components/Settings/EditUser.vue`

#### 5a — Add `isNewUser` computed and `formPassword` ref

```js
const isNewUser = computed(() => !props.userId);
const formPassword = ref('');
```

#### 5b — Add password field to the template

Inside the `<div class="grid grid-cols-2 ...">` grid, add a new field conditionally rendered
for new users. Place it after the Email field:

```html
<!-- Password (new user only) -->
<div v-if="isNewUser" class="max-w-sm">
  <label class="block text-sm font-bold mb-2 text-black dark:text-white">
    {{ $t('settings.password') }} <span class="text-[#EA021A]">*</span>
  </label>
  <input
    v-model="formPassword"
    type="password"
    class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400"
    :placeholder="$t('settings.password')"
  >
</div>
```

Add `*` asterisk spans to the First Name, Email, Department, and Role labels when `isNewUser`
is true (same pattern as above).

#### 5c — Update `submitForm` to branch on mode

Replace the `submitForm` function:

```js
const submitForm = async () => {
  const userId = props.userId;
  const userName = `${formFirstName.value} ${formLastName.value}`.trim();
  const userEmail = formEmail.value;
  const userDepartment = formSelectedDepartmentId.value;
  const userRole = formRole.value;
  const userPhone = parseInt(formPhone.value);
  const userInternalPhone = formInternalPhone.value;
  const userTitle = formTitle.value;
  const userTitleDescription = formTitleDescription.value || formTitle.value;
  const userImage = formImage.value;

  try {
    if (isNewUser.value) {
      if (!userName || !userEmail || !userDepartment || !userRole || !formPassword.value) {
        $toast.error(t('settings.requiredFieldsMissing'), { position: 'bottom-right', autoClose: 5000 });
        return;
      }
      await userStore.addUser(
        userName, userEmail, userDepartment, userRole,
        formPassword.value, userPhone, userInternalPhone,
        userTitle, userTitleDescription, userImage
      );
    } else {
      await userStore.editUser(
        userId, userName, userEmail, userDepartment, userRole,
        userPhone, userInternalPhone, userTitle, userTitleDescription, userImage
      );
    }

    $toast.success(t('settings.profileUpdated'), { position: 'bottom-right', autoClose: 5000 });
    emit('saved');
  } catch (error) {
    $toast.error(t('settings.profileUpdateError'), { position: 'bottom-right', autoClose: 5000 });
  }
};
```

#### 5d — Skip `fetchUserData` when `isNewUser`

In `fetchUserData()`, the existing `if (props.userId)` guard already handles this — no
change needed. The form will start empty for new users, which is the correct behaviour.

---

## i18n

Add the `password` and `requiredFieldsMissing` keys to all locale files if they don't already
exist. The key `settings.password` is needed for the new field label and placeholder.

---

## Summary of files changed

| File | Change |
|------|--------|
| `types/index.ts` | Add `AddUserPayload` interface |
| `composables/userApiComposable.ts` | Add `addUserComposable` export |
| `server/api/user/addUser.ts` | New file — Nuxt server route to `POST /users` |
| `stores/user.ts` | Add `addUser` action, expose in return |
| `components/Settings/EditUser.vue` | Add `isNewUser` mode with password field and branched submit |
| `intelligence-back/.../UserController.php` | Change `profile_image` from `required` to `nullable` in `store()` |
