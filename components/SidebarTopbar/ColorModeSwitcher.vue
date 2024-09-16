<template>
  <div>
    <ul>
      <li v-for="color of ['system', 'light', 'dark', 'sepia']" :key="color" :class="{
        preferred: !$colorMode.unknown && color === $colorMode.preference,
        selected: !$colorMode.unknown && color === $colorMode.value,
      }" @click="$colorMode.preference = color">
        <!-- Static SVGs for each color mode -->
        <svg v-if="color === 'dark'" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="feather feather-moon">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>

        <svg v-if="color === 'light'" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="feather feather-sun">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </li>


    </ul>
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
  padding: 7px;
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  margin: 0;
  border-radius: 5px;
  transition: all 0.1s ease;
}



.selected .feather {
  color: var(--color-primary);
}
</style>