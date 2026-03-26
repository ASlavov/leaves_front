# Custom Radial Bar Chart — Implementation Plan

## 1. Context & Goal

Replace `vue3-apexcharts` inside `components/Home/Metrics.vue` with a self-contained SVG radial bar component. ApexCharts is removed entirely from the chart render path; no library dependency remains for this widget.

**Stack:** Nuxt 3, TypeScript, Tailwind CSS, `@nuxtjs/i18n`, `@nuxtjs/color-mode`.

---

## 2. Figma Design Specification

Source node: `882:2465` — "rest leaves" frame, file `Ycvr5CtHbdxCad3Ai7f704`.

### 2.1 Card Dimensions & Layout

| Property | Value |
|---|---|
| Card size | 382 × 120 px |
| Card background | `#FFFFFF` light / `neutral-800` dark |
| Card border | `1px solid #DFEAF2` light / `neutral-700` dark |
| Card border-radius | `8px` |
| Card padding | no explicit padding — children use absolute insets |

### 2.2 Text Area (left side of card)

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Leave type name | Roboto | 16px | 700 | Dynamic from `getTypeColor()` |
| "Σύνολο:" / Total label | Roboto | 13px | 700 | `#000000` light / `#D1D5DB` dark |
| Total value | Roboto | 13px | 600 | `#808080` light / `#9CA3AF` dark |
| "Κατοχυρωμένες:" / Used label | Roboto | 13px | 700 | `#000000` light / `#D1D5DB` dark |
| Used value | Roboto | 13px | 600 | `#808080` light / `#9CA3AF` dark |

Text block: left `30px`, top `25px`, gap between name and stats row `15px`, gap between stat rows `4px`.

### 2.3 Chart Container (right side of card)

From Figma inset `[18px 30px 18px 268px]` within the 382 × 120px card:
- **Width:** 382 − 268 − 30 = **84px**
- **Height:** 120 − 18 − 18 = **84px**
- Chart is horizontally centered within this 84×84 box.

### 2.4 Radial Bar Visual Spec

| Property | Value |
|---|---|
| SVG viewBox | `0 0 84 84` |
| Circle center | (42, 42) |
| Outer radius | 38px |
| Inner radius (hollow) | 19px (50% of outer → `hollow: '50%'`) |
| Arc stroke radius (center of stroke) | 28.5px |
| Stroke width | 19px |
| Stroke linecap | `round` |
| Track color (light) | `#F3F4F6` |
| Track color (dark) | `#374151` |
| Fill color | Dynamic — `getTypeColor(leave_type_id)` |
| Arc direction | Clockwise, starts at 12 o'clock (−90° rotation) |

### 2.5 Center Labels (inside the ring)

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| "Υπόλοιπο" / label | Roboto | 12px | 500 | `#000000` light / `#9CA3AF` dark |
| Remaining days value | Roboto | 20px | 700 | `#000000` light / `#F3F4F6` dark |

Positioning (relative to SVG center at 42, 42):
- Label: `y = 36` (`text-anchor: middle`, `dominant-baseline: middle`)
- Value: `y = 54` (`text-anchor: middle`, `dominant-baseline: middle`)

### 2.6 Observed Colors per Leave Type (Figma samples)

| Leave Type | Color |
|---|---|
| Πληρωμένη άδεια (Paid) | `#9747FF` |
| Επιπλέον ημέρες WHY | `#52D3D8` |
| Εργασία από το σπίτι (WFH) | `#3330BA` |

These are derived at runtime by `getTypeColor(leave_type_id)` — no hardcoding needed.

---

## 3. File Structure

```
components/
  Home/
    Metrics.vue              ← modify: remove ApexCharts, use RadialBarChart
    RadialBarChart.vue       ← create: new custom SVG component
```

No new utilities, no new stores, no package installs.

---

## 4. `RadialBarChart.vue` — Component Specification

### 4.1 Props Interface (TypeScript)

```ts
interface Props {
  // Required
  percentage: number       // 0–100, drives the fill arc
  value: number            // the number shown in the center (remaining_days)
  color: string            // hex color for the filled arc stroke
  label: string            // i18n-translated label shown inside ring (e.g. "Remaining")

  // Optional / override
  size?: number            // rendered px size, default 84
  strokeWidth?: number     // default 19 (matches Figma hollow 50%)
  trackColorLight?: string // default '#F3F4F6'
  trackColorDark?: string  // default '#374151'
  labelFontSize?: number   // default 12
  valueFontSize?: number   // default 20
  animationDuration?: number // ms, default 900
}
```

### 4.2 Computed Geometry

```
outerRadius = (size / 2) - 4          // 4px margin
innerRadius = outerRadius * 0.5
strokeRadius = (outerRadius + innerRadius) / 2
strokeWidth  = outerRadius - innerRadius

circumference = 2 * Math.PI * strokeRadius
filledLength  = (percentage / 100) * circumference
dashArray     = `${filledLength} ${circumference}`
dashOffset    = 0   // arc starts where SVG path starts (rotated below)
```

The `<circle>` element is rotated −90° via `transform="rotate(-90, cx, cy)"` so the arc fills from 12 o'clock clockwise.

### 4.3 Template Structure

```html
<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    role="img"
    :aria-label="label"
    class="block"
  >
    <!-- Track ring (background circle) -->
    <circle
      :cx="center"
      :cy="center"
      :r="strokeRadius"
      fill="none"
      :stroke="trackColor"
      :stroke-width="strokeWidth"
    />

    <!-- Filled arc -->
    <circle
      ref="arcRef"
      :cx="center"
      :cy="center"
      :r="strokeRadius"
      fill="none"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      :stroke-dasharray="`${circumference} ${circumference}`"
      :stroke-dashoffset="animatedDashOffset"
      :transform="`rotate(-90, ${center}, ${center})`"
      class="radial-arc"
    />

    <!-- Label text (e.g. "Remaining") -->
    <text
      :x="center"
      y="36"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="labelFontSize"
      font-weight="500"
      font-family="Roboto, sans-serif"
      :fill="labelColor"
    >{{ label }}</text>

    <!-- Value text (remaining_days) -->
    <text
      :x="center"
      y="54"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="valueFontSize"
      font-weight="700"
      font-family="Roboto, sans-serif"
      :fill="valueColor"
    >{{ value }}</text>
  </svg>
</template>
```

> **Note on y values:** When `size` deviates from 84, `y="36"` and `y="54"` must be computed as `center - 6` and `center + 12` respectively (proportional offsets). These are computed properties, not hardcoded.

Exact formula:
```
labelY = center - (size * 0.071)   // ≈ 6px offset at size=84
valueY = center + (size * 0.143)   // ≈ 12px offset at size=84
```

### 4.4 Color Mode Reactivity

```ts
const { $colorMode } = useNuxtApp()
const isDark = computed(() => $colorMode?.value === 'dark')

const trackColor = computed(() =>
  isDark.value ? props.trackColorDark : props.trackColorLight
)
const labelColor = computed(() =>
  isDark.value ? '#9CA3AF' : '#000000'
)
const valueColor = computed(() =>
  isDark.value ? '#F3F4F6' : '#000000'
)
```

No watchers needed — computed properties re-evaluate automatically when `$colorMode.value` changes. This eliminates the `watch(theme, () => mychart.value.updateOptions(...))` pattern from the old code.

### 4.5 Animation Implementation

Use a single `animatedDashOffset` ref driven by `requestAnimationFrame` (no CSS transition, for full control and SSR safety):

```ts
const animatedDashOffset = ref(circumference.value) // starts at full offset (empty arc)

function animateArc(targetOffset: number, duration: number) {
  const start = performance.now()
  const from = circumference.value
  const to = targetOffset

  function step(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedDashOffset.value = from + (to - from) * eased
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

onMounted(() => {
  const targetOffset = circumference.value - (props.percentage / 100) * circumference.value
  animateArc(targetOffset, props.animationDuration)
})
```

**Arc fill formula:**
```
dashOffset = circumference - filledLength
           = circumference - (percentage / 100) * circumference
           = circumference * (1 - percentage / 100)
```

When `dashOffset = circumference` → arc is empty.
When `dashOffset = 0` → arc is fully filled.

**Reactive percentage change** (e.g. after data reload): watch `percentage` prop and re-run `animateArc` from the current animated position rather than from zero, to avoid jarring resets:

```ts
watch(() => props.percentage, () => {
  const targetOffset = circumference.value - (props.percentage / 100) * circumference.value
  animateArc(targetOffset, props.animationDuration)
})
```

### 4.6 i18n Reactivity

The `label` prop is passed as a **computed/reactive value** from the parent (`Metrics.vue`), not as a static string inside `RadialBarChart`. This means locale changes propagate automatically via prop reactivity — no watcher or manual update call inside `RadialBarChart` is needed.

---

## 5. `Metrics.vue` — Changes Required

### 5.1 Remove ApexCharts

- Delete `import ApexCharts from 'vue3-apexcharts'`
- Delete `const mychart = ref(null)`
- Delete `const chartOptions = ref({...})`
- Delete `const chartSeries = computed(...)`
- Delete both `watch(locale, ...)` and `watch(theme, ...)` blocks
- Remove `<ClientOnly><ApexCharts ... /></ClientOnly>` from template
- Remove `<style>:deep(.apexcharts-canvas)</style>`

### 5.2 Add RadialBarChart

Import:
```ts
import RadialBarChart from '~/components/Home/RadialBarChart.vue'
```

Computed values to pass as props:
```ts
const { t, locale } = useI18n()

// Already exists:
const leaveColor = computed(() => getTypeColor(props.leave.leave_type_id))
const percentageUsed = computed(() => {
  const entitled = props.leave.entitled_days || 0
  if (entitled === 0) return 0
  return Math.min(100, (usedDays.value / entitled) * 100)
})

// New — reactive label (re-evaluates on locale change automatically):
const chartLabel = computed(() => t('leaves.remaining'))
```

Template replacement (inside the right column `div.chart-container`):
```html
<template v-if="loading">
  <div class="w-[84px] h-[84px] rounded-full bg-gray-100 animate-pulse dark:bg-neutral-700"></div>
</template>
<template v-else>
  <RadialBarChart
    :percentage="percentageUsed"
    :value="leave.remaining_days || 0"
    :color="leaveColor"
    :label="chartLabel"
    :size="84"
  />
</template>
```

### 5.3 Card Layout Adjustment

Current ApexCharts uses `height="120" width="120"` which exceeds the Figma spec. Switching to 84×84 matches the design exactly. The right column `div` already has `flex items-center justify-end` — no layout changes needed.

---

## 6. Reactivity Contract

| Trigger | How it propagates | Old behavior |
|---|---|---|
| `locale` changes | `chartLabel = computed(() => t('leaves.remaining'))` re-evaluates → passed as prop → SVG `<text>` updates | Manual `watch(locale)` + `mychart.updateOptions()` |
| `$colorMode` changes | `trackColor`, `labelColor`, `valueColor` are computed → SVG attributes update | Manual `watch(theme)` + `mychart.updateOptions()` |
| `leave` prop changes (data reload) | `percentageUsed` and `leaveColor` are computed → re-animate via `watch(percentage)` | No handling — ApexCharts chart options were static refs |
| Component mount | `onMounted` triggers fill animation from 0 → target | ApexCharts had built-in animation |

---

## 7. SSR Safety

- No `window` or `document` access at module/setup level.
- `requestAnimationFrame` is called only inside `onMounted` — never during SSR.
- No `ClientOnly` wrapper needed (SVG renders fine server-side; animation simply doesn't run on server).
- `useNuxtApp().$colorMode` is safe to call in `computed` as Nuxt provides it in both contexts.

---

## 8. Dark Mode Visual Spec (not in Figma — derived from code)

| Element | Light | Dark |
|---|---|---|
| Card background | `#FFFFFF` | `neutral-800` (`#262626`) |
| Card border | `#DFEAF2` | `neutral-700` (`#404040`) |
| Leave type name | `getTypeColor()` | same |
| "Total" / "Used" labels | `#000000` | `#D1D5DB` (`gray-300`) |
| Label/value numbers | `#808080` | `#9CA3AF` (`gray-400`) |
| Arc track | `#F3F4F6` | `#374151` |
| Arc fill | `getTypeColor()` | same |
| Center label text | `#000000` | `#9CA3AF` |
| Center value text | `#000000` | `#F3F4F6` |

---

## 9. Edge Cases

| Case | Behavior |
|---|---|
| `entitled_days = 0` | `percentageUsed = 0` → arc is empty (dashOffset = circumference) |
| `remaining_days > entitled_days` | clamped by `Math.max(0, entitled - remaining)` for used days; `percentageUsed` clamped to 100 |
| `percentage = 100` | full arc; `dashOffset = 0` |
| `percentage = 0` | empty arc; `dashOffset = circumference` |
| Component re-used with different `leave` prop (v-for key change) | `onMounted` fires again → fresh animation |
| Same component updated in-place (same key, data refresh) | `watch(percentage)` fires → re-animate from current position |
| Very long `leave_type_name` | Already handled by `line-clamp-2` in Metrics.vue — no change needed |

---

## 10. Implementation Checklist

### Phase 1 — Create `RadialBarChart.vue`
- [ ] Define Props interface with all fields from §4.1
- [ ] Compute geometry: `center`, `outerRadius`, `innerRadius`, `strokeRadius`, `strokeWidth`, `circumference`
- [ ] Compute `labelY` and `valueY` from `center` (not hardcoded)
- [ ] Compute color mode values: `trackColor`, `labelColor`, `valueColor`
- [ ] Implement `animatedDashOffset` ref + `animateArc()` with ease-out cubic
- [ ] Call `animateArc` in `onMounted`
- [ ] Add `watch(percentage)` to re-animate on data change
- [ ] Build SVG template: track circle, fill circle, label text, value text
- [ ] Verify `rotate(-90, center, center)` on fill circle for 12 o'clock start
- [ ] Verify `stroke-linecap="round"` on fill circle only (not track)

### Phase 2 — Update `Metrics.vue`
- [ ] Remove ApexCharts import and all related refs/computed/watchers
- [ ] Import `RadialBarChart`
- [ ] Add `chartLabel` computed using `t('leaves.remaining')`
- [ ] Replace `<ClientOnly><ApexCharts .../>` with `<RadialBarChart .../>` binding all props
- [ ] Update loading skeleton size from `w-[80px] h-[80px]` to `w-[84px] h-[84px]` (Figma spec)
- [ ] Remove `<style scoped>` ApexCharts deep selector

### Phase 3 — Verify
- [ ] Light mode: arc color, track, text colors match Figma
- [ ] Dark mode: track `#374151`, labels `#9CA3AF`/`#F3F4F6`
- [ ] Locale switch (el ↔ en): center label updates without re-mount
- [ ] Color mode switch: colors update without re-mount or flash
- [ ] `leave` data refresh: arc re-animates smoothly
- [ ] 0% leave: empty arc renders correctly (no NaN in dashArray)
- [ ] 100% leave: full arc, no overflow artifacts from `round` linecap
- [ ] SSR: page renders without hydration mismatch (animation skipped server-side)

---

## 11. Uninstall ApexCharts (Optional — After Verification)

Once `RadialBarChart` is confirmed stable, if `vue3-apexcharts` is not used elsewhere:
```bash
npm uninstall vue3-apexcharts apexcharts
```

Check first:
```bash
grep -r "apexcharts\|ApexCharts" components/ pages/ plugins/ --include="*.vue" --include="*.ts"
```

Only uninstall if zero other references exist.
