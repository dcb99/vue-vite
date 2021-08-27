import Wraxios from "./Wraxios";
import axios, { AxiosResponse } from "axios";
import store from "../store/index";
import Vue from "vue";
import { UserData, SnackbarColors } from "../../models/MiscTypes";
import router from "../router/index";
import { Translations } from "./../translations/Translations";

export async function getMissingPersonAttributes(wraxios: Wraxios): Promise<string[]> {
    const missingAttributes = [] as string[];

    function hasMissingAttributes(response: AxiosResponse) {
        response.data.forEach((x: string) => {
            missingAttributes.push(x);
        });
    }

    const callbacks = {
        200: hasMissingAttributes
    };

    await wraxios.get(
        axios,
        "person/getMissingRequired",
        callbacks
    );

    return missingAttributes;
}

export async function checkForLoginQuery(wraxios: Wraxios) {
    const urlParams = new URLSearchParams(window.location.search);
    const loginQuery = urlParams.get("login");

    async function getUserDataSuccess(response: AxiosResponse) {
        const missingAttributes = await getMissingPersonAttributes(wraxios);

        Vue.nextTick(async () => {
            const data = response.data as UserData;
            store.commit("set_userData", data.person.personAttributes);
            store.commit("set_userSessionHash", data.userSessionData.sessionHash);
            store.commit("set_userIsAuthenticated", true);
            store.commit("set_userLoginTime", data.userSessionData.lastLoggeedInTime);

            if (missingAttributes.length > 0) {
                try {
                    store.commit("set_missingRequiredAttributes", missingAttributes);
                    await router.push("UserProfile");
                } catch { }
            }
        });
    }

    function getUserDataFailure() {
        const translations = store.getters.get_translations as Translations;
        store.commit("push_snackbar", {
            text: translations.problemConfirmingLoginStatus,
            color: SnackbarColors.error
        });

        window.location.href = "/";
    }

    if (loginQuery) {
        await wraxios.get(
            axios,
            "account/getUserData",
            {
                200: getUserDataSuccess,
                400: getUserDataFailure
            }
        );
    }
}
