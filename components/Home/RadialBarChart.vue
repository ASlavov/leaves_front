<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    role="img"
    :aria-label="label"
    class="block overflow-visible"
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
      class="radial-arc transition-[stroke-dashoffset] duration-300"
    />

    <!-- Label text (e.g. "Remaining") -->
    <text
      :x="center"
      :y="labelY"
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
      :y="valueY"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="valueFontSize"
      font-weight="700"
      font-family="Roboto, sans-serif"
      :fill="valueColor"
    >{{ value }}</text>
  </svg>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';

interface Props {
  percentage: number;
  value: number;
  color: string;
  label: string;
  size?: number;
  strokeWidth?: number;
  trackColorLight?: string;
  trackColorDark?: string;
  labelFontSize?: number;
  valueFontSize?: number;
  animationDuration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 84,
  strokeWidth: 19,
  trackColorLight: '#F3F4F6',
  trackColorDark: '#374151',
  labelFontSize: 12,
  valueFontSize: 20,
  animationDuration: 900,
});

const center = computed(() => props.size / 2);
const outerRadius = computed(() => (props.size / 2) - 4);
const innerRadius = computed(() => outerRadius.value * 0.8);
const strokeRadius = computed(() => (outerRadius.value + innerRadius.value) / 2);
const strokeWidth = computed(() => outerRadius.value - innerRadius.value);
const circumference = computed(() => 2 * Math.PI * strokeRadius.value);

const labelY = computed(() => center.value - (props.size * 0.071));
const valueY = computed(() => center.value + (props.size * 0.143));

const { $colorMode } = useNuxtApp();
const isDark = computed(() => ($colorMode as any)?.value === 'dark');

const trackColor = computed(() =>
  isDark.value ? props.trackColorDark : props.trackColorLight
);
const labelColor = computed(() =>
  isDark.value ? '#9CA3AF' : '#000000'
);
const valueColor = computed(() =>
  isDark.value ? '#F3F4F6' : '#000000'
);

const animatedDashOffset = ref(circumference.value);

function animateArc(targetOffset: number, duration: number) {
  const start = performance.now();
  const from = animatedDashOffset.value;
  const to = targetOffset;

  function step(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    animatedDashOffset.value = from + (to - from) * eased;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

onMounted(() => {
  const targetOffset = circumference.value - (Math.min(100, props.percentage) / 100) * circumference.value;
  animateArc(targetOffset, props.animationDuration);
});

watch(() => props.percentage, (newPercentage) => {
  const targetOffset = circumference.value - (Math.min(100, newPercentage) / 100) * circumference.value;
  animateArc(targetOffset, props.animationDuration);
});
</script>

<style scoped>
</style>
