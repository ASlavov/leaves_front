<template>
    <div class="container mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-4">
            <div class="lg:col-span-3 flex flex-col">
                <ProfileInfo />
            </div>
            <div class="lg:col-span-3 flex flex-col">
               <UserGroupInfo />
            </div>
            <div class="lg:col-span-6 flex flex-col">
                <h3 class="py-4 font-semibold text-lg">Άδειες έτους</h3>
                <div class="flex-1 space-y-3 max-h-[500px] overflow-y-auto">
                    <LeavesYearInfo />
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import ProfileInfo from '~/components/Home/ProfileInfo.vue'
import UserGroupInfo from '~/components/Home/UserGroupInfo.vue'
import LeavesYearInfo from '~/components/Home/LeavesYearInfo.vue'
</script>