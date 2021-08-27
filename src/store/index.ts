import { createStore, Store } from "vuex";
import { 
  GetLookupTableInput,
  LookupTable,
  LookupTableDataResponse,
  LookupTableRequestState,
  PageTypes,
  RemoveFileRequest,
  RequestBodyErrorPayload,
  SearchDependenciesArgs,
  Snackbar,
  SnackbarBody,
  UpdateDependenciesObject,
  UpdateRequestBody
} from "../../models/miscTypes";
import { MaintReqState } from "./interfaces";
import { FileToUpload } from "../../models/miscTypes";
import { LangCodes, populateTranslations, SetTranslationsPayload } from "../translations/translations";
import {isEmpty, cloneDeep} from "lodash";
import axios, { AxiosError, AxiosResponse } from "axios";
import Wraxios from "../services/Wraxios";

type obj = {[key: string]: string};

const store = createStore({
    state() {
        return {
            userIsAuthenticated: false,
            userSessionHash: "",
            userLoginTime: "",
            userData: {},
            translations: {},
            defaultText: {},
            langauage: "" as LangCodes,
            snackbars: [] as SnackbarBody[],
            lookupTableData: {
                isLoading: false,
                headers: [] as Array<object>,
                tableData: {} as {[key: string]: any}[],
                show: false,
                error: false,
                inputId: "",
                lookupTableRequestState: {} as LookupTableRequestState,
                searchFields: {},
                valueToSubmit: ""
            },
            lookupTableSearchDependencies: {},
            missingRequiredAttributes: [] as string[],
            newRequestBody: {} as { [key: string]: { [key: string]: string | FileToUpload[] | boolean } },
            newRequestBodyErrors: {} as { [key: string]: { [key: string]: boolean } },
            showOverlay: false,
            userSessionInvalidated: false,
            maximoConnectionIssues: false,
            dependenciesObject: {} as {[key: string]: {[key: string]: string[]} },
            discrepancies: {} as obj,
            lookupTableDefaultFilters: {} as obj,
            isRegistrationDisabled: false
        } as MaintReqState
    },
    getters: {
        get_userIsAuthenticated: (state: MaintReqState) => state.userIsAuthenticated,
        get_userSessionHash: (state: MaintReqState) => state.userSessionHash,
        get_userLoginTime: (state: MaintReqState) => state.userLoginTime,
        get_userData: (state: MaintReqState) => state.userData,
        get_snackbars: (state: MaintReqState) => state.snackbars,
        get_language: (state: MaintReqState) => state.langauage,
        get_translations: (state: MaintReqState) => {
            if (state.translations && state.translations[state.langauage]) {
                return state.translations[state.langauage]
            } else {
                return state.defaultText;
            }
        },
        get_lookupTableData: (state: MaintReqState) => state.lookupTableData,
        get_missingRequiredAttributes: (state: MaintReqState) => state.missingRequiredAttributes,
        get_newRequestBody: (state: MaintReqState) => state.newRequestBody,
        get_showOverlay: (state: MaintReqState) => state.showOverlay,
        get_userSessionInvalidated: (state: MaintReqState) => state.userSessionInvalidated,
        get_maximoConnectionIssues: (state: MaintReqState) => state.maximoConnectionIssues,
        get_newRequestBodyErrors: (state: MaintReqState) => state.newRequestBodyErrors,
        get_dependenciesObject: (state: MaintReqState) => state.dependenciesObject,
        get_discrepancies: (state: MaintReqState) => state.discrepancies,
        get_lookupTableDefaultFilters: (state: MaintReqState) => state.lookupTableDefaultFilters,
        get_lookupTableSearchDependencies: (state: MaintReqState) => state.lookupTableSearchDependencies,
        get_isRegistrationDisabled: (state: MaintReqState) => state.isRegistrationDisabled
    },
    mutations: {
        set_userIsAuthenticated: (state: MaintReqState, payload: boolean) => state.userIsAuthenticated = payload,
        set_userSessionHash: (state: MaintReqState, payload: string) => state.userSessionHash = payload,
        set_userLoginTime: (state: MaintReqState, payload: string) => state.userLoginTime = payload,
        set_userData: (state: MaintReqState, payload: obj) => state.userData = payload,
        set_snackbars: (state: MaintReqState, payload: SnackbarBody[]) => state.snackbars = payload,
        push_snackbar: (state: MaintReqState, payload: SnackbarBody) => state.snackbars.push(payload),
        set_language: (state: MaintReqState, payload: LangCodes) => state.langauage = payload,
        set_translations: (state: MaintReqState, payload: SetTranslationsPayload) => 
            state.translations[payload.langCode] = populateTranslations(payload.translations),
        set_defaultText: (state: MaintReqState, payload: {[key: string]: string | number}) =>
            state.defaultText = payload,
        set_lookupTableData: (state: MaintReqState, payload: LookupTable) => state.lookupTableData = payload,
        set_missingRequiredAttributes: (state: MaintReqState, payload: string[]) => state.missingRequiredAttributes = payload,
        update_newRequestBody: (state: MaintReqState, payload: UpdateRequestBody) => {
            const formId = payload.formId;
            const current = state.newRequestBodyErrors[formId];
            const updated = { ...current, ...payload.body};
            state.newRequestBody[formId] = updated;
        },
        remove_file_from_requestBody: (state: MaintReqState, payload: RemoveFileRequest) => {
            const doclinksArr = state.newRequestBody[payload.formId][payload.maxAttribute] as FileToUpload[];

            for (let i = 0; i < doclinksArr.length; i++) {
                if ((doclinksArr[i] as FileToUpload).name.toLocaleLowerCase() === payload.fileName.toLocaleLowerCase()) {
                    doclinksArr.splice(i, 1);

                    if (isEmpty(doclinksArr)) {
                        delete state.newRequestBody[payload.formId][payload.maxAttribute];
                    }

                    return;
                }
            }

            throw "Could not remove file from upload list.";
        },
        clear_newRequestBody_formId: (state: MaintReqState, payload: string) => delete state.newRequestBody[payload],
        set_showOverlay: (state: MaintReqState, payload: boolean) => state.showOverlay = payload,
        set_userSessionInvalidated: (state: MaintReqState, payload: boolean) => state.userSessionInvalidated = payload,
        set_maximoConnectionIssues: (state: MaintReqState, payload: boolean) => state.maximoConnectionIssues = payload,
        set_newRequestBodyErrors: (state: MaintReqState, payload: RequestBodyErrorPayload) => {
            const formId = payload.formId;
            var currentErrors = state.newRequestBodyErrors[formId];
            const updatedErrors = {...currentErrors, ...payload.payload};
            state.newRequestBodyErrors[formId] = updatedErrors;
        },
        set_dependenciesObject: (state: MaintReqState, payload: UpdateDependenciesObject) =>
            state.dependenciesObject[payload.formId] = payload.body,
        set_discrepancies: (state: MaintReqState, payload: obj) =>
            state.discrepancies = payload,
        set_lookupTableDefaultFilters: (state: MaintReqState, payload: obj) =>
            state.lookupTableDefaultFilters = payload,
        set_lookupTableSearchDependencies: (state: MaintReqState, payload: SearchDependenciesArgs) => {
            const formId = payload.formId;
            const maxattribute = payload.maxAttribute;
            const searchDeps = payload.searchDependencies;

            const updateObj = {
                ...state.lookupTableSearchDependencies[formId],
                [maxattribute]: searchDeps
            };

            state.lookupTableSearchDependencies[formId] = updateObj;
        },
        resetLookupTableSearchDependencies: (state: MaintReqState) => state.lookupTableSearchDependencies = {},
        set_isRegistrationDisabled: (state: MaintReqState, payload: boolean) => state.isRegistrationDisabled = payload
    },
    actions: {
        do_setUserIsAuthenticated(context, payload: boolean) {
            context.commit("set_userIsAuthenticated", payload);
        },
        do_setUserSessionHash(context, payload: string) {
            context.commit("set_userSessionHash", payload);
        },
        do_setUserLoginTime(context, payload: string) {
            context.commit("set_userLoginTime", payload);
        },
        do_setUserData(context, payload: { [key: string]: string; }) {
            context.commit("set_userData", payload);
        },
        do_setDefaultText(context, payload: { [key: string]: string; }) {
            context.commit("set_defaultText", payload);
        },
        do_showSnackbar(context, payload: SnackbarBody) {
            try {
                if (payload.text.startsWith("<!DOCTYPE html>")) {
                    return;
                }

                if (payload.text.startsWith("System.")) {
                    context.commit("push_snackbar", {
                        text: "Something went wrong. Please try again or contact support.",
                        color: "error"
                    });

                    return;
                }

                context.commit("push_snackbar", {
                    text: payload.text,
                    color: payload.color,
                });
            } catch (error) {
                return;
            }
        },
        async textInputLookup(context, input: GetLookupTableInput) {
            // Because of the nature of this application, there's a very
            // high probability of having duplicate element IDs on an input
            // form. To help differentiate an input for submitting a new
            // request vs any other input, such as a lookup field in a data 
            // table, `-input` is appended to the ID of an input element on 
            // any new request form. We have to strip out the `-input` to 
            // isolate the value that actually represents the maxAttribute
            // that we're trying to work with.
            const maxAttribute = input.maxAttribute?.substring(0, input.maxAttribute.indexOf("-input")) as string;
            const requestBody = cloneDeep(input);

            requestBody.maxAttribute = maxAttribute;

            context.commit("set_lookupTableData", {
                ...this.getters.get_lookupTableData,
                show: true,
                isLoading: true,
                headers: [],
                tableData: [],
                lookupTableRequestState: {} as LookupTableRequestState
            });

            // eslint-disable-next-line
            function handle200(context: Store<any>, response: AxiosResponse, maxAttrId?: string | undefined) {
                const result = response.data as LookupTableDataResponse;

                const tableHeaders = [] as Array<object>;
                result.headers.forEach((item: object, index: number) => {
                    tableHeaders.push({ text: item, value: result.fields[index] });
                });

                const searchFields = result.lookupTableSearchDependencies?.customFilters;

                context.commit("set_lookupTableData", {
                    ...context.getters["get_lookupTableData"],
                    isLoading: false as boolean,
                    error: false as boolean,
                    headers: tableHeaders as Array<object>,
                    tableData: result.tableData,
                    inputId: maxAttrId as string,
                    lookupTableRequestState: result.lookupTableRequestState as LookupTableRequestState,
                    searchFields: searchFields,
                    valueToSubmit: result.valueToSubmit as string
                } as LookupTable);

                const searchDepsPayload: SearchDependenciesArgs = {
                    formId: input.formId as string,
                    maxAttribute: maxAttribute as string,
                    searchDependencies: result.lookupTableSearchDependencies
                };

                context.commit("set_lookupTableSearchDependencies", searchDepsPayload);

                if (result.lookupTableSearchDependencies !== null) {
                    if (result.lookupTableSearchDependencies.defaultFilters !== null) {
                        context.commit("set_lookupTableDefaultFilters",
                            result.lookupTableSearchDependencies.defaultFilters);
                    }
                }
            }

            // eslint-disable-next-line
            function handleError(context: Store<any>, response: AxiosError) {
                context.commit("set_lookupTableData", {
                    ...context.getters["get_lookupTableData"],
                    show: false,
                    isLoading: false,
                    headers: [],
                    tableData: [],
                    error: true,
                    lookupTableRequestState: {},
                    searchFields: {}
                } as LookupTable);

                context.commit("push_snackbar", {
                    text: "There was a problem getting data from the server. Please try again or contact support.",
                    color: "error"
                } as SnackbarBody);
            }

            const wraxios = new Wraxios();

            await wraxios.post(
                axios,
                input.lookupTableUrl as string,
                {
                    maxAttribute: maxAttribute as string,
                    pageName: input.pageName as string,
                    pageType: input.pageType as PageTypes,
                    searchParams: input.searchParams
                },
                {
                    200: (response: AxiosResponse) => handle200(this, response, input.maxAttribute),
                    400: (error: AxiosError) => handleError(this, error),
                    500: (error: AxiosError) => handleError(this, error)
                }
            );
        },
    }
});

export default store;

