import { MultipleMarkdown } from "./MarkDown";

export enum SnackbarColors {
    info = "info",
    warn = "warning",
    error = "error",
    success = "success"
};

export interface Snackbar {
    readonly key: string;
    readonly top: boolean;
    readonly bottom: boolean;
    readonly left: boolean;
    readonly right: boolean;
    readonly color: SnackbarColors;
    readonly transition: string;
    readonly message: string;
    show: boolean;
}

export interface SnackbarBody {
    readonly text: string;
    readonly top?: boolean;
    readonly bottom?: boolean;
    readonly left?: boolean;
    readonly right?: boolean;
    readonly color?: SnackbarColors;
    readonly transition?: string;
    readonly timeout?: [number, string];
    // eslint-disable-next-line
    [key: string]: any;
}

export interface UpdateInputRequest {
    inputId: string;
    newValue: string | boolean;
    pageName: string;
    pageType: string;
    url?: string;
    isRegistration?: boolean;
    callbacks: { [key: number]: Function; };
};

export interface PersonModel {
    personAttributes: Record<string, string>;
    requiredAttributes: string[];
    timezone?: string;
    personId?: string;
    language?: string;
};

export interface LookupTableRequestState {
    // Primarily used for holding data related to pagination
    // in the data table component.
    href?: string;
    totalCount?: number;
    pagenum?: number;
    totalPages?: number;
    pageSize?: number;
}

export interface LookupTableDefaultFilters {
    // Used to hold data needed to enable default filtering or
    // using a value from an input form to provide default filtering
    // in the data table component.
    defaultValues?: { [key: string]: string; };
    getValueFrom?: string[];
}

export interface LookupTableSearchProperties {
    defaultFilters: LookupTableDefaultFilters;
    customFilters: { [key: string]: string; };
}

export interface LookupTable {
    isLoading: boolean;
    headers: Array<object>;
    // eslint-disable-next-line
    tableData: { [key: string]: any; }[];
    show: boolean;
    error: boolean;
    inputId: string;
    lookupTableRequestState: LookupTableRequestState;
    searchFields: { [key: string]: string; };
    valueToSubmit: string;
}

export interface LookupTableDataResponse {
    // eslint-disable-next-line
    tableData: { [key: string]: any; }[];
    fields: string[];
    headers: Array<object>;
    lookupTableRequestState: LookupTableRequestState;
    valueToSubmit: string;
    lookupTableSearchDependencies: LookupTableSearchProperties;
}

export interface LookupTableInput {
    maxAttribute?: string;
    pageName: string;
    pageNumber: number;
    pageType: PageTypes;
    searchParams: { [key: string]: string | number | boolean; };
}

export interface GetLookupTableInput extends LookupTableInput {
    lookupTableUrl?: string;
    formId?: string;
    ignoreDefaultFiltering?: boolean;
}

export interface GetInquiryTableInput extends LookupTableInput {
    searchNumber: number;
}

export interface UserSessionData {
    sessionHash: string;
    lastLoggeedInTime?: Date;
    userIsAuthenticated: boolean;
    person: PersonModel;
}

export interface UserData {
    userSessionData: UserSessionData;
    person: PersonModel;
}

export interface UiButton {
    label: string;
    type: string;
    value: string;
}

export interface ButtonsResponse {
    buttons: UiButton[];
    title: string;
    editPageName?: string;
}

export interface InquiryTableResponse {
    // tableData contains all of the data that will be displayed in the table. Since the inquiry table could
    // be built with many different combinations of maxattributes, the keys are not garaunteed to be the same.
    // eslint-disable-next-line
    tableData: { [key: string]: any; }[];
    fields: string[];
    headers: string[];
    valueToSubmit: string;
    lookupTableRequestState: LookupTableRequestState;
    lookupTableSearchDependencies: LookupTableSearchProperties;
}

export interface RequestTypes {
    label: string;
    id: string;
}

export interface FileToUpload {
    name: string;
    content: string;
    type: string;
    description: string;
}

export interface SearchDependenciesArgs {
    formId: string;
    maxAttribute: string;
    searchDependencies: LookupTableSearchProperties;
}

export interface WorklogDetailsInput {
    pageName: string;
    worklogBody: { [key: string]: string; };
}

export interface RequestBodyErrorPayload {
    formId: string;
    payload: { [key: string]: boolean; };
}

export interface NewRequestResponse {
    editPageName: string;
    uniqueId: string;
    originalSnapshot: {};
    discrepancies: {};
};

export interface RemoveFileRequest {
    formId: string;
    fileName: string;
    maxAttribute: string;
}

export interface UpdateRequestBody {
    formId: string;
    body: {[key: string]: string | FileToUpload[]};
}

export interface UpdateDependenciesObject {
    formId: string;
    body: {[key: string]: string[]};
}

export enum PageTypes {
    NewMaximoObject = "NewMaximoObject",
    UserProfile = "UserProfile",
    EditPage = "EditPage"
}

export interface LookupTableInput {
    maxAttribute?: string;
    pageName: string;
    pageNumber: number;
    pageType: PageTypes;
    searchParams: { [key: string]: string | number | boolean; };
}

export interface GetLookupTableInput extends LookupTableInput {
    lookupTableUrl?: string;
    formId?: string;
    ignoreDefaultFiltering?: boolean;
}

export interface LoginPageData {
    loginPlaceHolderText: string;
    loginType: string;
    textAboveInput: MultipleMarkdown;
    textBelowInput: MultipleMarkdown;
    icon: string;
    userIsLoggedIn: boolean;
    toastColor: string;
    toastMessage: string;
    isRegistrationDisabled: boolean;
}
