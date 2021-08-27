import store from "../store/index";
import { AxiosInstance, AxiosError } from "axios";
import { handle403, handle503 } from "./WraxiosHelpers";
import { SnackbarBody, SnackbarColors } from "../../models/MiscTypes";
import { Translations } from "../translations/translations";
class Wraxios {
    // This class servers as a wrapper around axios requests. By having
    // get/post functions around an axios call, we can centralize handling
    // the responses from the requests. This helps reduce redundant code.
    // Instead of having each component deal with responses, they can be
    // handled here, something that's especially helpful for ubiquitous statuses
    // like 400 and 500.
    // The get and post functions each accept the global axios instance, the url,
    // and a callbacks object as arguments. The get function also accepts an 
    // option params object to be sent to the server. The callback object 
    // represents the functions to be executed based on the response from the server.
    // For example: 
    // {
    //    400: this.genericBadRequest,
    //    403: shared.handle403
    // }
    // where the key (as a number) is the status code and the value is the function
    // to execute. In this example, as the the get/post function loops through the 
    // callbacks object, if the status code happens to be 400, the genericBadRequest
    // function will be executed. 
    // This design allows for each component to deal with handling success/failures
    // of responses in their own way but also rely on global handling for the most
    // common failure responses.

    private mergeCallbacks(callbacks: { [key: number]: Function; }): { [key: number]: Function; } {
        // Automatically add the function that handles 403 errors to the callbacks
        // and add 400 error from components if it exists in the callbacks, otherwise
        // use the generic bad request function.
        let mergedCallbacks = {
            500: this.genericBadRequest
        } as { [key: number]: Function; };

        if (Object.keys(callbacks).includes("400")) {
            mergedCallbacks = {
                ...mergedCallbacks,
                ...callbacks,
                403: handle403,
                503: handle503
            };
            return mergedCallbacks;
        } else {
            mergedCallbacks = {
                ...mergedCallbacks,
                ...callbacks,
                400: this.genericBadRequest,
                403: handle403,
                503: handle503,
            };

            return mergedCallbacks;
        }
    }

    private genericBadRequest(error: AxiosError) {
        const translations: Translations = store.getters.get_translations;

        const snackbarText = (!!error.response?.data && error.response?.data !== "")
            ? error.response?.data
            : translations.problemGettingInformationFromTheServer;

        store.commit("set_showOverlay", false);
        store.commit("push_snackbar", {
            text: snackbarText,
            color: SnackbarColors.error
        } as SnackbarBody);
    }

    public async get(
        axios: AxiosInstance,
        url: string,
        callbacks: { [key: number]: Function; },
        params?: {}
    ) {
        const mergedCallbacks = this.mergeCallbacks(callbacks);
        try {
            const response = await axios.get(url, {
                params: params
            });
            Object.keys(mergedCallbacks).forEach(key => {
                if (response.status === parseInt(key)) {
                    mergedCallbacks[response.status](response);
                    return;
                }
            });
            return;
        } catch (error) {
            Object.keys(mergedCallbacks).forEach(key => {
                if (error.response?.status === parseInt(key)) {
                    mergedCallbacks[error.response.status](error);
                    return;
                }
            });
            return;
        }
    }

    public async post(
        axios: AxiosInstance,
        url: string,
        payload: object,
        callbacks: { [key: number]: Function; }
    ) {
        const mergedCallbacks = this.mergeCallbacks(callbacks);
        try {
            const response = await axios.post(url, payload);
            Object.keys(mergedCallbacks).forEach(key => {
                if (response.status === parseInt(key)) {
                    mergedCallbacks[response.status](response);
                    return;
                }
            });
            return;
        } catch (error) {
            store.commit("set_showOverlay", false);
            Object.keys(mergedCallbacks).forEach(key => {
                if (error.response?.status === parseInt(key)) {
                    mergedCallbacks[error.response.status](error);
                    return;
                }
            });
            return;
        }
    }
}

export default Wraxios;