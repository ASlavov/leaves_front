import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from "~/stores/user.js";

const permissions = {
    profile_leave_balance: {
        view: ['admin', 'hr', 'head', 'user'],
        request_leave: ['hr', 'head', 'user'],
        cancel_leave: ['hr', 'head', 'user'],
        accept_leave: ['admin', 'hr', 'head'],
        decline_leave: ['admin', 'hr', 'head'],
    },
    profile_info: {
        view: ['admin', 'hr', 'head', 'user'],
        modify: ['admin', 'hr', 'head', 'user'],
        change_password: ['admin', 'hr', 'head', 'user'],
    },
    group: {
        view: ['admin', 'hr', 'head', 'user'],
        modify: ['admin', 'hr'],
    },
    // Add more categories as needed...
};
