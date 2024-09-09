<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900">
    <div
      class="login w-full max-w-md p-4 bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
      <h2 class="text-2xl font-bold text-center text-gray-700 dark:text-gray-300 pb-10">Σύνδεση</h2>
      <form class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Διεύθυνση Email</label>
          <input id="email" name="email" type="email" required
            class="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your email">
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Κωδικός</label>
          <input id="password" name="password" type="password" required
            class="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your password">
        </div>
        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Να με θυμάσαι</span>
          </label>
          <NuxtLink to="forgot-password" class="text-sm text-blue-700">Ξέχασα τον κωδικό μου</NuxtLink>
        </div>
        <button type="submit"
          class="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none">
          ΣΥΝΔΕΣΗ
        </button>
      </form>
    </div>
  </div>
</template>
