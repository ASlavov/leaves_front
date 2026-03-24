<template>
  <div class="flex">
    <div @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'"
         class="relative inline-block w-12 h-6 cursor-pointer">
      <!-- Background -->
      <span :class="$colorMode.value === 'dark' ? 'bg-gray-600' : 'bg-gray-100'"
            class="absolute inset-0 rounded-full transition duration-300 ease-in-out">
        <svg v-if="$colorMode.value === 'dark'" xmlns="http://www.w3.org/2000/svg" width="25" height="25"
             viewBox="0 0 24 24"
             fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="feather feather-moon px-1">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"
             fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="feather feather-sun px-1 ml-[23px]">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      </span>
      <span :class="$colorMode.value === 'dark' ? 'translate-x-6 bg-gray-100' : 'translate-x-0 bg-gray-600'"
            class="absolute left-0 top-0 w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow">
      </span>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul li {
  display: inline-block;
  padding: 5px;
}

p {
  margin: 0;
  padding-top: 5px;
  padding-bottom: 20px;
}

.feather {
  position: relative;
  top: 0px;
  cursor: pointer;
  /*  padding: 7px;*/
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 5px;
  transition: all 0.1s ease;
}


.selected .feather {
  color: var(--color-primary);
}
</style>
<script setup lang="ts">
</script>