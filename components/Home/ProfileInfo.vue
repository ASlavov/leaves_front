<template>
    <h3 class="py-4 font-semibold text-lg">Πληροφορίες</h3>
    <div class="bg-white border rounded-lg shadow-md p-4 flex-1 flex flex-col">
        <div class="flex-1">
            <!-- Avatar -->
            <div class="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                <!-- Optionally add an `img` element inside for a real avatar image -->
                <!-- <img src="path/to/avatar.jpg" alt="Avatar" class="w-full h-full rounded-full object-cover"> -->
                <span class="text-white font-bold">DL</span> <!-- Placeholder for initial or icon -->
            </div>
            <!-- Info Details -->
            <div class="pt-4 space-y-2">
                <p><span class="font-bold">Όνομα: </span><span class="text-gray-500">Αλέξανδρος</span></p>
                <p><span class="font-bold">Επώνυμο: </span><span class="text-gray-500"> Γυφτομήτρος</span>
                </p>
                <p><span class="font-bold">Τίτλος: </span><span class="text-gray-500"> Senior UI/UX
                        Designer</span></p>
                <p><span class="font-bold">Email: </span><span class="text-gray-500">
                        agyftomitros@whyagency.gr</span></p>
                <p><span class="font-bold">Κινητό: </span><span class="text-gray-500"> +30 697
                        3320818</span></p>
                <p><span class="font-bold">Εσωτ. Τηλέφωνο: </span><span class="text-gray-500"> 05</span></p>
                <p><span class="font-bold">Γκρουπ: </span><span class="text-gray-500"> Creative group
                        02</span></p>
            </div>
        </div>
        <div class="info-actions pt-10 pb-5 flex gap-4">
            <button
                class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                Επεξεργασία
            </button>
            <button class="font-bold text-gray-800 dark:text-white mx-auto text-md">
                Αλλαγή κωδικού
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: ' ProfileInfo'
}
</script>