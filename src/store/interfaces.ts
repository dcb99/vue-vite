import { Translations, LangCodes } from "../translations/translations";
import { SnackbarBody, LookupTable, FileToUpload } from "./../../models/miscTypes";

export interface MaintReqState {
    userIsAuthenticated: boolean;
    userSessionHash: string;
    userLoginTime: string;
    userData: { [key: string]: string };
    translations: {[key: string]: Translations};
    defaultText: { [key: string]: string | number };
    langauage: LangCodes;
    snackbars: SnackbarBody[];
    lookupTableData: LookupTable;
    lookupTableSearchDependencies: { [key: string]: { [key: string]: {} }};
    missingRequiredAttributes: string[];
    newRequestBody: { [key: string]: { [key: string]: string | FileToUpload[] | boolean }};
    newRequestBodyErrors: {[key: string]: {[key: string]: boolean}};
    showOverlay: boolean;
    userSessionInvalidated: boolean;
    maximoConnectionIssues: boolean;
    dependenciesObject: {[key: string]: {[key: string]: string[]}};
    discrepancies: {[key: string]: string};
    lookupTableDefaultFilters: {[key: string]: string};
    isRegistrationDisabled: boolean;
};