<template>
    <div class="container mx-auto">
        <h3 class="py-4">Υπόλοιπα άδειας</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div class="bg-white border rounded-lg shadow-md p-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h5 class="text-lg font-semibold mb-4">Πληρωμένη άδεια</h5>
                        <div><span class="font-bold">Σύνολο: </span> <span class="font-light">22</span></div>
                        <div><span class="font-bold">Σύνολο: </span> <span class="font-light">22</span></div>
                    </div>
                    <div>
                        <div class="">
                            <div id="chart">
                                <canvas ref="radialChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <div class="bg-white border rounded-lg shadow-md p-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h5 class="text-lg font-semibold mb-4">Πληρωμένη άδεια</h5>
                        <div><span class="font-bold">Σύνολο: </span> <span class="font-light">22</span></div>
                        <div><span class="font-bold">Σύνολο: </span> <span class="font-light">22</span></div>
                    </div>
                    <div>
                        <div class="">
                            graf
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white border rounded-lg shadow-md p-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h5 class="text-lg font-semibold mb-4">Πληρωμένη άδεια</h5>
                        <div><span class="font-bold">Σύνολο: </span> <span class="font-light">22</span></div>
                        <div><span class="font-bold">Σύνολο: </span> <span class="font-light">22</span></div>
                    </div>
                    <div>
                        <div class="">
                            graf
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-row justify-center items-center leave-actions space-x-4">
                <button class="bg-red-600 text-white rounded-full py-2 px-4 hover:bg-red-600 focus:outline-none">
                    Νέο αίτημα άδειας
                </button>
                <a class="px-5" href="#">Ακύρωση άδειας</a>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    name: 'Search',
}
</script>