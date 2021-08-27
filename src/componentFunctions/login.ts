
import { ref, reactive, nextTick } from "vue";
import { AxiosError, AxiosResponse } from "axios";
import { LookupTable, LookupTableRequestState, SnackbarBody, SnackbarColors } from "../../models/miscTypes";
import { getQueryParam } from "../services/CommonFunctions";
import { Store } from "vuex";
import router from "./../router/index";
import { Translations } from "../translations/translations";
import { MaintReqState } from "../store/interfaces";

export function setInitialState(store: Store<MaintReqState>): void {
    store.commit("set_missingRequiredAttributes", []);
    store.dispatch("do_setUserSessionHash", "");
    store.dispatch("do_setUserData", {});
    store.dispatch("do_setUserLoginTime", "");
    store.dispatch("do_setUserIsAuthenticated", false);
    store.commit("set_lookupTableData", {
        isLoading: false,
        headers: [] as Array<object>,
        tableData: {} as { [key: string]: any; }[],
        show: false,
        error: false,
        inputId: "",
        lookupTableRequestState: {} as LookupTableRequestState,
        searchFields: {},
        valueToSubmit: ""
    } as LookupTable);
    store.commit("set_defaultRequestBody");
}

export async function loginButtonSuccess(response: AxiosResponse, store: Store<MaintReqState>) {
    store.dispatch("do_setUserIsAuthenticated", true);
    store.dispatch("do_setUserSessionHash", response.data.sessionHash);
    store.dispatch("do_setUserLoginTime", response.data.lastLoggeedInTime);
    store.dispatch("do_setUserData", response.data.person.personAttributes);

    const queryParam = getQueryParam("langcode");

    if (!!queryParam) {
        await router.push(`landingPage?langCode=${queryParam}`);
    } else {
        await router.push("landingPage");
    }
}

export async function loginButtonFailure(error: AxiosError, translations: Translations, store: Store<MaintReqState>) {
    nextTick(() => {
        store.commit("do_showSnackbar", {
            color: SnackbarColors.error,
            text: error.response?.data || translations.invalidLoginPleaseTryAgain
        } as SnackbarBody)
    });
}

