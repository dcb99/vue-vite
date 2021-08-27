import store from "../store/index";
import { AxiosResponse } from "axios";
import router from "../router/index";

// eslint-disable-next-line
export function handle403(response: AxiosResponse) {
    store.commit("set_userIsAuthenticated", false);
    store.commit("set_userSessionHash", "");
    store.commit("set_userData", {});
    store.commit("set_showOverlay", false);
    store.commit("set_userSessionInvalidated", true);
    window.localStorage.removeItem("maintreq");


    if (router.currentRoute.path === "/") {
        return;
    }

    // eslint-disable-next-line
    window.location.href = "/";
}

// eslint-disable-next-line
export function handle503(response: AxiosResponse) {

    store.commit("set_userIsAuthenticated", false);
    store.commit("set_userSessionHash", "");
    store.commit("set_userData", {});
    store.commit("set_showOverlay", false);
    store.commit("set_maximoConnectionIssues", true);
    window.localStorage.removeItem("maintreq");

    if (router.currentRoute.path === "/") {
        return;
    }

    window.location.href = "/";
}