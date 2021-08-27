import { ref, reactive } from "vue";
import store from "./../store/index";

export function getQueryParam(param: string): string {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get(param) || "";
}
