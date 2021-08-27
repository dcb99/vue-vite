import { createRouter, createWebHistory } from "vue-router";
import store from "./../store/index";
import { checkForLoginQuery } from "../services/RouterHelpers";
import Wraxios from "../services/Wraxios";

const routes = [
    {
        name: "Login",
        path: "/",
        component: () => import("../components/Login.vue")
    },

    {
        name: "LandingPage",
        path: "/LandingPage",
        component: () => import("../components/LandingPage.vue")
    },

    {
        name: "SelectRequestType",
        path: "/SelectRequestType",
        component: () => import("./../components/SelectRequestType.vue"),
        meta: {
            requiresAuth: true
        }
    },

    {
        name: "ObjectRequest",
        path: "/ObjectRequest",
        component: () => import("./../components/ObjectRequest.vue"),
        meta: {
            requiresAuth: true
        }
    },

    {
        name: "Error",
        path: "*",
        component: () => import("./../components/Error.vue")
    },

    {
        name: "UserProfile",
        path: "/UserProfile",
        component: () => import("./../components/Profile.vue"),
        meta: {
            requiresAuth: true
        }
    },

    {
        name: "InquiryPage",
        path: "/InquiryPage",
        component: () => import("./../components/InquiryPage.vue"),
        meta: {
            requiresAuth: true
        }
    },

    {
        name: "EditPage",
        path: "/EditPage",
        component: () => import("./../components/EditPage.vue"),
        meta: {
            requiresAuth: true
        }
    },

    {
        name: "Registration",
        path: "/Registration",
        component: () => import("./../components/Registration.vue"),
        // eslint-disable-next-line
        beforeEnter: async (to: any, from: any, next: any) => {
            if (store.getters.get_isRegistrationDisabled === false) {
                await next();
            }
        }
    },

    {
        name: "Status",
        path: "/status/tests",
        component: () => import("./../components/Status.vue")
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    // As long as to.name isn't 'registration', check if a login query param exists                                                                              
    const registrationRegex = new RegExp("registration", "i");

    if (!registrationRegex.test(to.name as string)) {
        await checkForLoginQuery(new Wraxios());
    }

    if (
        store.state.userIsAuthenticated &&
        store.state.missingRequiredAttributes.length >= 1 &&
        to.name !== "UserProfile"
    ) {
        next({ name: "UserProfile" });
    } else {
        store.commit("set_defaultRequestBody");
        next();
    }
});

export default router;
