<template>
    <div>
        <div v-if="leavesData.length === 0" class="text-center text-gray-500 font-semibold">
            No leaves available.
        </div>
        <div v-else>
            <div v-for="(leave, index) in leavesData" :key="index"
                class="flex items-center bg-white border shadow-sm rounded-md p-4 space-x-4 mb-4">
                <!-- Icon Column -->
                <div class="flex-shrink-0">
                    <img src="https://placehold.co/150x150" alt="Icon" class="h-6 w-6">
                </div>
                <!-- First Text Column -->
                <div class="flex-1">
                    <div class="text-sm text-gray-300">
                        {{ leave.start_date }} - {{ leave.end_date }}
                    </div>
                    <div class="font-semibold">
                        {{ getLeaveTypeName(leave.leave_type_id) }} <!-- Filtered leave type name -->
                    </div>
                </div>
                <!-- Second Text Column (Centered) -->
                <div class="flex-1 text-center">
                    <div :class="{
                        'text-green-500': leave.status === 'pending',
                        'text-yellow-500': leave.status === 'approved',
                        'text-red-500': leave.status === 'cancelled',
                        'text-red-700': leave.status === 'rejected'
                    }">
                        {{ leave.status === 'approved' ? 'Αποδεκτή' : leave.status === 'pending' ? 'Σε εκκρεμότητα' :
                            leave.status === 'cancelled' ? 'Ακυρώθηκε' :
                        'Απορρίφθηκε' }}
                    </div>
                </div>
                <!-- Third Text Column (Right Aligned) -->
                <div class="flex-1 text-right">
                    <button class="font-semibold underline text-black">Ακύρωση άδειας</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore';

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;

// Use computed to get leavesData and leaveTypes
const leavesData = computed(() => leavesStore.leavesData.currentUser);
const leaveTypes = computed(() => leavesStore.leavesData.leavesTypes);

// Function to get leave type name based on leave_type_id
const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.value.find(type => type.id === leaveTypeId);
    return leaveType ? leaveType.name : 'Unknown'; // Default to 'Unknown' if not found
};
</script>
