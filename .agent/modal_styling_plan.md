# Modal Styling Plan — Figma Alignment

Source: https://www.figma.com/design/Ycvr5CtHbdxCad3Ai7f704/Intelligence_app_v2?node-id=1066-4733

---

## 1. Figma Design Token Reference

These are the exact values extracted from the Figma node. All styling decisions below derive from these.

| Token | Light value | Dark value (derived) |
|-------|-------------|----------------------|
| Modal background | `#FFFFFF` | `bg-neutral-900` (#171717) |
| Modal border-radius | `10px` | same |
| Modal shadow | `0px 0px 12px 0px rgba(0,0,0,0.25)` | `0px 0px 12px 0px rgba(0,0,0,0.6)` |
| Modal max-width | `675px` | same |
| Title font-size | `24px` | same |
| Title font-weight | `bold` | same |
| Title color | `#000000` | `#FFFFFF` |
| Title top offset | `35px` (padding-top on content) | same |
| Label font-size | `14px` | same |
| Label font-weight | `bold` | same |
| Label color | `#000000` | `text-gray-100` (#f3f4f6) |
| Label–input gap | `8px` | same |
| Input height | `40px` | same |
| Input padding | `8px 16px` | same |
| Input border | `1px solid #DFEAF2` | `1px solid` `neutral-600` (#525252) |
| Input border-radius | `8px` | same |
| Input background | `#FFFFFF` | `neutral-800` (#262626) |
| Input placeholder color | `#808080` | `neutral-400` (#a3a3a3) |
| Input hover border | `gray-400` | `neutral-400` |
| Input focus ring | `blue-500` | `blue-400` |
| Form column width | `300px` fixed | same |
| Form horizontal gap | `15px` | same |
| Form vertical gap | `15px` | same |
| Form side padding | `30px` | same |
| Form top padding | `222px` from modal top (avatar takes ~157px) | same |
| Avatar size | `~110px` diameter | same |
| Avatar edit btn size | `25px` | same |
| Avatar edit btn bg | `#EA021A` | same |
| Avatar fallback bg | `bg-gray-300` | `neutral-600` |
| Submit btn bg | `#EA021A` | same |
| Submit btn hover | `red-700` (#b91c1c) | same |
| Submit btn border-radius | `70px` (full pill) | same |
| Submit btn padding | `15px 20px` | same |
| Submit btn font-size | `14px` | same |
| Submit btn font-weight | `bold` | same |
| Close btn color | `gray-500` (#6b7280) | `neutral-400` |
| Close btn hover | `gray-700` (#374151) | `neutral-100` |
| Overlay bg | `rgba(0,0,0,0.5)` | same |
| Select trigger height | `40px` | same |
| Select trigger padding | `8px 16px` | same |
| Select border | `#DFEAF2` | `neutral-600` |
| Select bg | `#FFFFFF` | `neutral-800` |

---

## 2. BaseModal.vue — Required Changes

### 2a. Container div

**Current:**
```html
<div class="bg-white dark:bg-neutral-700 rounded-lg w-full max-w-[900px] relative">
```

**Target:**
```html
<div class="bg-white dark:bg-neutral-900 rounded-[10px] w-full max-w-[675px] relative
            shadow-[0px_0px_12px_0px_rgba(0,0,0,0.25)]
            dark:shadow-[0px_0px_12px_0px_rgba(0,0,0,0.6)]">
```

Changes:
- `dark:bg-neutral-700` → `dark:bg-neutral-900` (neutral-700 is too light/green-tinted; 900 is clean near-black)
- `rounded-lg` (8px) → `rounded-[10px]`
- `max-w-[900px]` → `max-w-[675px]`
- Add `shadow-[0px_0px_12px_0px_rgba(0,0,0,0.25)]` (light mode)
- Add `dark:shadow-[0px_0px_12px_0px_rgba(0,0,0,0.6)]` (dark mode — stronger to be visible on dark backgrounds)

### 2b. Title bar (when `title` prop is set)

**Current:**
```html
<div v-if="title" class="flex items-center justify-between px-4 pt-4 pb-3 border-b dark:border-neutral-600">
  <h2 class="text-lg font-bold dark:text-gray-100">{{ title }}</h2>
  <button ...><CloseIcon /></button>
</div>
```

**Target:**
```html
<div v-if="title" class="relative flex items-center justify-center pt-[35px] pb-4">
  <h2 class="text-[24px] font-bold text-black dark:text-white">{{ title }}</h2>
  <button @click="$emit('update:modelValue', false)"
          class="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-100">
    <CloseIcon />
  </button>
</div>
```

Changes:
- Remove `border-b` and `justify-between` — title is centered, close button is absolutely positioned
- `text-lg` → `text-[24px]`
- Add `text-black dark:text-white` on h2
- Close button moved to absolute position top-right of the title div
- `pt-[35px]` gives the exact Figma top offset for the title

### 2c. Close button (no-title mode)

**Current:**
```html
<button v-else @click="..." class="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
```

**Target:**
```html
<button v-else @click="..." class="absolute top-4 right-4 text-gray-500 hover:text-gray-700
                                   dark:text-neutral-400 dark:hover:text-neutral-100">
```

Changes: add dark mode colors, slight position adjustment `top-3` → `top-4` / `right-3` → `right-4` for better breathing room.

### 2d. Add `maxWidth` prop (optional but useful)

Some modals (EditLeaveType, small forms) are narrower than 675px. Add an optional prop:
```js
defineProps({
  modelValue: { type: Boolean, required: true },
  title:      { type: String, default: '' },
  maxWidth:   { type: String, default: 'max-w-[675px]' },
});
```
Apply it: `:class="[..., maxWidth]"` on the container div.

---

## 3. EditUser.vue — Modal Mode Styling

When `asModal = true`, the component currently renders with no outer wrapper (correct per Phase 2 of `modal_homogenization_plan.md`). The inner layout needs the following changes for modal mode.

### 3a. Content padding

**Current form container (`v-else` branch):**
```html
<div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
```

**Target (modal mode):** Remove the 12-column grid. The layout should be:
- Avatar centered above the form
- Form in a padded container: `px-[30px] pb-[30px]`

When `asModal = false` (inline in ProfileInfo): keep the existing `grid grid-cols-12` layout intact — the avatar in the left column, form on the right, as it currently is.

Structure in modal mode:
```html
<!-- avatar: centered, standalone -->
<div class="flex justify-center pt-[30px] pb-[20px]">
  <!-- avatar circle + edit button -->
</div>
<!-- form fields: two-column flex-wrap -->
<div class="px-[30px] pb-[30px]">
  <div class="flex flex-wrap gap-[15px]">
    <!-- each field: w-[300px] -->
  </div>
  <!-- submit button row -->
  <div class="pt-[30px]">
    <button ...>...</button>
  </div>
</div>
```

### 3b. Avatar (modal mode)

**Current:**
```html
<div class="relative w-[132px] h-[132px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-2">
  <img ... class="cursor-pointer inline-block w-[132px] h-[132px] rounded-full object-cover">
  <span v-else class="text-white font-bold">{{ initials }}</span>
  <button class="absolute bottom-1 right-1 bg-[#EA021A] rounded-full p-2">...</button>
</div>
```

**Target (modal mode):**
```html
<div class="relative w-[110px] h-[110px] bg-gray-300 dark:bg-neutral-600 rounded-full flex items-center justify-center">
  <img ... class="cursor-pointer w-[110px] h-[110px] rounded-full object-cover">
  <span v-else class="text-white font-bold text-lg">{{ initials }}</span>
  <button class="absolute bottom-0 right-0 w-[25px] h-[25px] bg-[#EA021A] rounded-full flex items-center justify-center">
    <!-- pencil SVG scaled to 13px -->
  </button>
</div>
```

Changes:
- `132px` → `110px` (matches Figma's ~110px)
- Remove `mr-4 col-span-2` (not in grid mode)
- Edit button: `p-2` → explicit `w-[25px] h-[25px]` (Figma: 25×25px)
- Add `dark:bg-neutral-600` on fallback avatar background

### 3c. Form fields grid

**Current:**
```html
<div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px]">
  <div class="max-w-sm">...
```

**Target (modal mode):**
```html
<div class="flex flex-wrap gap-[15px]">
  <div class="w-[300px]">...
```

Changes:
- `grid grid-cols-2` → `flex flex-wrap` (matches Figma's flex-wrap layout)
- `gap-x-[25px] gap-y-[15px]` → `gap-[15px]` (Figma uses uniform 15px gap)
- `max-w-sm` (384px) → `w-[300px]` (Figma: exact 300px per field)
- Remove `col-span-10`

### 3d. Input fields

**Current:**
```html
<input class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all
              hover:border-gray-400 dark:hover:border-neutral-300 text-sm
              focus:border-blue-500 focus:ring-blue-500
              dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
```

**Target:**
```html
<input class="h-[40px] py-[8px] px-[16px] block w-full
              border border-[#DFEAF2] rounded-[8px]
              bg-white text-[14px] text-black placeholder-[#808080]
              transition-all hover:border-gray-400
              focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
              dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-100
              dark:placeholder-neutral-400 dark:hover:border-neutral-400">
```

Changes:
- `py-3` (12px) → `py-[8px]` + explicit `h-[40px]`
- `border-gray-200` → `border-[#DFEAF2]`
- `rounded-lg` → `rounded-[8px]` (same visual result, explicit)
- Add `bg-white dark:bg-neutral-800` (Figma: white bg on inputs)
- `dark:border-neutral-700` → `dark:border-neutral-600` (slightly more visible)
- `dark:hover:border-neutral-300` → `dark:hover:border-neutral-400` (less jarring)
- Add explicit `text-black dark:text-gray-100` for entered values
- Add `placeholder-[#808080] dark:placeholder-neutral-400`

This class string is long — recommend extracting as a CSS utility or a computed string constant inside the component. For example at the top of `<script setup>`:
```js
const inputClass = "h-[40px] py-[8px] px-[16px] block w-full border border-[#DFEAF2] rounded-[8px] bg-white text-[14px] text-black placeholder-[#808080] transition-all hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-100 dark:placeholder-neutral-400 dark:hover:border-neutral-400";
```
Then use `:class="inputClass"` on each input.

### 3e. Labels

**Current:**
```html
<label class="block text-sm font-bold mb-2 text-black dark:text-white">
```

**Target:**
```html
<label class="block text-[14px] font-bold mb-[8px] text-black dark:text-gray-100">
```

Changes:
- `text-sm` → `text-[14px]` (explicit, same value)
- `mb-2` → `mb-[8px]` (explicit, same value)
- `dark:text-white` → `dark:text-gray-100` (#f3f4f6 — slightly softer than pure white, easier on the eyes in dark mode)

### 3f. Submit button

**Current:**
```html
<button class="py-3 inline-flex justify-center rounded-3xl border border-transparent
               bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
```

**Target:**
```html
<button class="inline-flex items-center justify-center
               py-[15px] px-[20px]
               rounded-[70px]
               bg-[#EA021A] hover:bg-red-700
               text-[14px] font-bold text-white
               transition-colors focus:outline-none">
```

Changes:
- `py-3` (12px) → `py-[15px]`
- `px-4` (16px) → `px-[20px]`
- `rounded-3xl` (24px) → `rounded-[70px]` (full pill per Figma)
- `text-md font-medium` → `text-[14px] font-bold`
- Remove `border border-transparent` (unnecessary)
- Remove `shadow-sm` (not in Figma)
- Add `transition-colors`

### 3g. Loading skeleton (modal mode)

**Current skeleton:**
```html
<div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
  <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 ..."></div>
  <div class="pt-4 space-y-2 col-span-10 ...">...
```

**Target (modal mode):** Mirror the actual content layout — centered avatar skeleton + 2-column field skeletons:
```html
<!-- avatar skeleton: centered -->
<div class="flex justify-center pt-[30px] pb-[20px]">
  <div class="w-[110px] h-[110px] bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
</div>
<!-- field skeletons: flex-wrap matching form layout -->
<div class="px-[30px] pb-[30px] flex flex-wrap gap-[15px]">
  <div v-for="i in 6" :key="i" class="w-[300px]">
    <div class="h-[14px] bg-gray-200 dark:bg-neutral-700 rounded w-1/3 mb-[8px] animate-pulse"></div>
    <div class="h-[40px] bg-gray-200 dark:bg-neutral-700 rounded-[8px] animate-pulse"></div>
  </div>
</div>
```

---

## 4. EditUser.vue — Inline Mode (ProfileInfo.vue)

When `asModal = false`:
- Keep the existing outer card wrapper: `bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100`
- Keep the `grid grid-cols-12` avatar-in-left-column layout
- Only apply the input/label/button token changes (3d, 3e, 3f above) — these improve the inline form too
- The avatar size can stay at `132px` in inline mode (more space available)

This means the template needs `v-if="asModal"` / `v-else` branches for the **structural layout** (grid vs flex-wrap, avatar position), but **shares** the same input/label/button classes in both modes.

---

## 5. Cross-Component Shared Token Class — Recommendation

Since the same input/label/button tokens apply to **all** modal form components, define them once. Two options:

**Option A — JS constants in each component (low friction):**
```js
// In each component's <script setup>
const inputClass = "h-[40px] py-[8px] px-[16px] block w-full border border-[#DFEAF2] rounded-[8px] bg-white text-[14px] text-black placeholder-[#808080] transition-all hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-100 dark:placeholder-neutral-400 dark:hover:border-neutral-400";

const labelClass = "block text-[14px] font-bold mb-[8px] text-black dark:text-gray-100";

const submitBtnClass = "inline-flex items-center justify-center py-[15px] px-[20px] rounded-[70px] bg-[#EA021A] hover:bg-red-700 text-[14px] font-bold text-white transition-colors focus:outline-none";
```

**Option B — Composable `useFormStyles.ts`:**
```ts
// composables/useFormStyles.ts
export const useFormStyles = () => ({
  input:  "h-[40px] py-[8px] px-[16px] ...",
  label:  "block text-[14px] font-bold mb-[8px] ...",
  submit: "inline-flex items-center ... rounded-[70px] ...",
});
```
Import with `const { input: inputClass, label: labelClass, submit: submitBtnClass } = useFormStyles();`.

Option B is cleaner for long-term maintenance since a single change propagates everywhere. Recommend Option B.

---

## 6. Per-Component Adjustments

Apply the same token changes (labels, inputs, submit button, form container) from Section 3 to:

### EditGroup.vue
- Same outer wrapper conditional (`asModal`)
- Same label/input/button tokens
- `flex flex-wrap gap-[15px]` form grid
- `w-[300px]` per field
- Full-width `col-span-2` fields (`CustomMultiSelect`) → `w-full` within the flex container, or a `<div class="w-full">` wrapper

### EditEntitlement.vue
- Same tokens
- The tooltip span on "Entitled Days" label: keep as-is, just update surrounding label class
- Date inputs: apply `inputClass` — they already use `ref=` for flatpickr, adding `h-[40px]` ensures flatpickr's calendar trigger area is consistent
- Full-width `col-span-2` multi-select (employee selector) → `w-full` wrapper

### EditLeaveType.vue (after revamp per `modal_homogenization_plan.md`)
- Strip outer card entirely (modal-only component)
- Single full-width input → `w-full` inside `px-[30px] py-[20px]`
- Submit button: apply `submitBtnClass`
- No `max-w-2xl mx-auto mt-8` — those are replaced by BaseModal container constraints
- Title comes from BaseModal's `title` prop, not an internal `h2`

### NewLeaves.vue
- Strip outer card and internal `h2`
- Two-column grid (`md:grid-cols-2`) layout can stay — it's a different UX pattern (configuration + selection panel side-by-side)
- Match input/label tokens throughout
- Buttons: Cancel button removed (BaseModal close handles it); Assign button gets `submitBtnClass`
- The `px-[30px]` should wrap the entire form content

### CustomSelect.vue
The select trigger needs to match input height/border/bg:

**Current trigger:**
```html
<div class="py-3 px-4 flex items-center justify-between w-full border border-gray-200 rounded-lg bg-white text-sm dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-sm">
```

**Target:**
```html
<div class="h-[40px] py-[8px] px-[16px] flex items-center justify-between w-full
            border border-[#DFEAF2] rounded-[8px] bg-white text-[14px]
            transition-all hover:border-gray-400
            dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-400
            dark:hover:border-neutral-400">
```

Changes:
- `py-3` → `py-[8px]` + `h-[40px]` explicit
- `border-gray-200` → `border-[#DFEAF2]`
- `rounded-lg` → `rounded-[8px]`
- `dark:bg-neutral-900` → `dark:bg-neutral-800` (matches input bg token)
- `dark:border-neutral-700` → `dark:border-neutral-600`
- Remove `shadow-sm` (not in Figma)
- Remove `focus-within:ring-2` (chevron div handles focus, not outer; keep `focus:ring` on actual input inside dropdown)

CustomMultiSelect.vue: apply the same trigger changes.

---

## 7. Dark Mode Design Rationale

The dark mode palette used here intentionally avoids the current `neutral-700` (#404040) modal background in favour of a deeper, cleaner hierarchy:

| Layer | Class | Hex | Why |
|-------|-------|-----|-----|
| Modal container | `neutral-900` | #171717 | Deep background, clearly "above" the page |
| Input / Select bg | `neutral-800` | #262626 | One step lighter — readable depth |
| Borders | `neutral-600` | #525252 | Visible but not harsh |
| Input hover border | `neutral-400` | #a3a3a3 | Clear hover feedback |
| Label text | `gray-100` | #f3f4f6 | Near-white, not blinding |
| Placeholder text | `neutral-400` | #a3a3a3 | Muted but readable |
| Entered value text | `gray-100` | #f3f4f6 | High contrast on neutral-800 bg |
| Title text | `white` | #ffffff | Maximum contrast for modal title |
| Close button | `neutral-400` | #a3a3a3 | Visible, non-distracting |
| Close btn hover | `neutral-100` | #f5f5f5 | Clear hover state |
| Avatar fallback bg | `neutral-600` | #525252 | Matches border tone |
| Skeleton pulse | `neutral-700` | #404040 | Standard for dark skeletons |

The `neutral-700` previously used as the modal background clashes with the `neutral-700` skeleton color — unifying to `neutral-900` container / `neutral-800` inputs makes the dark hierarchy clean and avoids this collision.

---

## 8. Execution Order

Work through files in this order to enable incremental visual verification:

1. `components/shared/BaseModal.vue` — container sizing, shadow, title styling
2. `composables/useFormStyles.ts` — define shared token constants (new file)
3. `components/misc/CustomSelect.vue` — trigger height/border/bg tokens
4. `components/misc/CustomMultiSelect.vue` — same trigger tokens
5. `components/Settings/EditUser.vue` — full layout refactor (avatar center, flex-wrap grid, all tokens)
6. `components/Settings/EditGroup.vue` — apply tokens + flex-wrap grid
7. `components/Settings/EditEntitlement.vue` — apply tokens
8. `components/Settings/EditLeaveType.vue` — apply tokens (after homogenization plan Phase 4)
9. `components/Settings/NewLeaves.vue` — apply tokens (after homogenization plan Phase 5)

---

## 9. Files Touched Summary

| File | What changes |
|------|-------------|
| `components/shared/BaseModal.vue` | Width 675px, radius 10px, shadow, title 24px centered, close btn dark colors, optional maxWidth prop |
| `composables/useFormStyles.ts` | New — shared `inputClass`, `labelClass`, `submitBtnClass` constants |
| `components/misc/CustomSelect.vue` | Trigger height 40px, border `#DFEAF2`, bg tokens, dark mode tokens |
| `components/misc/CustomMultiSelect.vue` | Same trigger changes as CustomSelect |
| `components/Settings/EditUser.vue` | Avatar centered + 110px modal mode, flex-wrap grid 300px fields, all token classes, skeleton refactor |
| `components/Settings/EditGroup.vue` | flex-wrap grid, all token classes |
| `components/Settings/EditEntitlement.vue` | All token classes, date input height |
| `components/Settings/EditLeaveType.vue` | All token classes, strip standalone card |
| `components/Settings/NewLeaves.vue` | All token classes, strip standalone card and h2 |

**Not touched:** `components/Home/ProfileInfo.vue`, `pages/settings.vue`, list components (UsersList, GroupsList, etc.)
