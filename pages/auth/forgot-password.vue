<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900">
      <div
        class="forgot-password w-full max-w-md p-4 bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
        <h2 class="text-2xl font-bold text-center text-gray-700 dark:text-gray-300 pb-10">Ξεχάσατε τον κωδικό σας;</h2>
        <form class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Διεύθυνση Email</label>
            <input id="email" name="email" type="email" required
              class="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Εισάγετε το email σας" aria-describedby="email-error">
            <p id="email-error" class="text-sm text-red-600"></p>
          </div>
          <button type="submit"
            class="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none">
            ΑΠΟΣΤΟΛΗ ΣΥΝΔΕΣΜΟΥ
          </button>
        </form>
        <div class="mt-4 text-center">
          <NuxtLink to="../auth/login" class="text-sm text-blue-700">Επιστροφή στην είσοδο</NuxtLink>
        </div>
      </div>
    </div>
  </template>
  