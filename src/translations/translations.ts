export type LangCodes = "en" | "es" | "pt-br";

export interface SetTranslationsPayload {
    langCode: LangCodes;
    translations: { [key: string]: string | number; };
}

export interface Translations {
    readonly pageNotFound: string;
    readonly attributes: string;
    readonly browse: string;
    readonly cancel: string;
    readonly close: string;
    readonly clear: string;
    readonly contactSupport: string;
    readonly createdBy: string;
    readonly dateCreated: string;
    readonly description: string;
    readonly details: string;
    readonly detailsTitle: string;
    readonly emailIsNotProperlyFormatted: string;
    readonly enterTheMissingInformation: string;
    readonly failedToLogOut: string;
    readonly failedToSendEmail: string;
    readonly fileIsTooLarge: string;
    readonly fileTypesMustBeOneOfTheFollowing: string;
    readonly filesCantBeEmpty: string;
    readonly fileTypes: string;
    readonly fixErrorsOnTheForm: string;
    readonly goBack: string;
    readonly home: string;
    readonly inquiryPage: string;
    readonly invalidLoginPleaseTryAgain: string;
    readonly isRequired: string;
    readonly login: string;
    readonly loginPlaceholderText: string;
    readonly logout: string;
    readonly newWorklog: string;
    readonly newWorklogAdded: string;
    readonly noDataAvailable: string;
    readonly noProfileChanges: string;
    readonly numberMustBeAnInteger: string;
    readonly orDropFilesHere: string;
    readonly pleaseCheckYourEmailForConfirmation: string;
    readonly pleaseCompleteTheForm: string;
    readonly problemValidatingDate: string;
    readonly problemConfirmingLoginStatus: string;
    readonly problemGettingDataFor: string;
    readonly problemGettingInformationFromTheServer: string;
    readonly problemLoadingTheForm: string;
    readonly problemSubmittingNewWorklog: string;
    readonly problemWithDataSent: string;
    readonly problemWithRegistrationData: string;
    readonly profileInformation: string;
    readonly readyToUpload: string;
    readonly recordWasntFound: string;
    readonly register: string;
    readonly required: string;
    readonly reset: string;
    readonly rowsPerPage: string;
    readonly submit: string;
    readonly save: string;
    readonly search: string;
    readonly selectYourRequestPage: string;
    readonly sessionHasExpired: string;
    readonly somethingWentWrong: string;
    readonly successfullyLoggedOut: string;
    readonly successfullyUpdatedProfile: string;
    readonly summary: string;
    readonly theLoginFieldIsRequired: string;
    readonly thereWasAnErrorCreatingTheRequest: string;
    readonly thereWasAProblemConfirmingYourRegistration: string;
    readonly thereWasAProblemSendingTheConfirmationMessage: string;
    readonly type: string;
    readonly unableToGetContentFromServer: string;
    readonly updateProfile: string;
    readonly websiteTitle: string;
    readonly worklogs: string;

    readonly firstName: string;
    readonly lastName: string;
    readonly emailAddress: string;
    readonly phone: string;
    readonly site: string;
    readonly class: string;

    readonly linkNoLongerValid: string;
    readonly registrationTokenUnclaimed: string;
    readonly registrationTokenExpired: string;
    readonly registrationTokenDisabled: string;
    readonly registrationContactSupport: string;

    readonly remove: string;
}

export class Translation implements Translations {
    pageNotFound: string;
    attributes: string;
    browse: string;
    cancel: string;
    close: string;
    clear: string;
    contactSupport: string;
    createdBy: string;
    dateCreated: string;
    description: string;
    details: string;
    detailsTitle: string;
    emailIsNotProperlyFormatted: string;
    enterTheMissingInformation: string;
    failedToLogOut: string;
    failedToSendEmail: string;
    fileIsTooLarge: string;
    fileTypesMustBeOneOfTheFollowing: string;
    filesCantBeEmpty: string;
    fileTypes: string;
    fixErrorsOnTheForm: string;
    goBack: string;
    home: string;
    inquiryPage: string;
    invalidLoginPleaseTryAgain: string;
    isRequired: string;
    login: string;
    loginPlaceholderText: string;
    logout: string;
    newWorklog: string;
    newWorklogAdded: string;
    noDataAvailable: string;
    noProfileChanges: string;
    numberMustBeAnInteger: string;
    orDropFilesHere: string;
    pleaseCheckYourEmailForConfirmation: string;
    pleaseCompleteTheForm: string;
    problemValidatingDate: string;
    problemConfirmingLoginStatus: string;
    problemGettingDataFor: string;
    problemGettingInformationFromTheServer: string;
    problemLoadingTheForm: string;
    problemSubmittingNewWorklog: string;
    problemWithDataSent: string;
    problemWithRegistrationData: string;
    profileInformation: string;
    readyToUpload: string;
    recordWasntFound: string;
    register: string;
    required: string;
    reset: string;
    rowsPerPage: string;
    submit: string;
    save: string;
    search: string;
    selectYourRequestPage: string;
    sessionHasExpired: string;
    somethingWentWrong: string;
    successfullyLoggedOut: string;
    successfullyUpdatedProfile: string;
    summary: string;
    theLoginFieldIsRequired: string;
    thereWasAnErrorCreatingTheRequest: string;
    thereWasAProblemConfirmingYourRegistration: string;
    thereWasAProblemSendingTheConfirmationMessage: string;
    type: string;
    unableToGetContentFromServer: string;
    updateProfile: string;
    websiteTitle: string;
    worklogs: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phone: string;
    site: string;
    class: string;
    linkNoLongerValid: string;
    registrationTokenUnclaimed: string;
    registrationTokenExpired: string;
    registrationTokenDisabled: string;
    registrationContactSupport: string;
    remove: string;

    constructor(
        pageNotFound: string,
        attributes: string,
        browse: string,
        cancel: string,
        close: string,
        clear: string,
        contactSupport: string,
        createdBy: string,
        dateCreated: string,
        description: string,
        details: string,
        detailsTitle: string,
        emailIsNotProperlyFormatted: string,
        enterTheMissingInformation: string,
        failedToLogOut: string,
        failedToSendEmail: string,
        fileIsTooLarge: string,
        fileTypesMustBeOneOfTheFollowing: string,
        fileTypes: string,
        filesCantBeEmpty: string,
        fixErrorsOnTheForm: string,
        goBack: string,
        home: string,
        inquiryPage: string,
        invalidLoginPleaseTryAgain: string,
        isRequired: string,
        login: string,
        loginPlaceholderText: string,
        logout: string,
        newWorklog: string,
        newWorklogAdded: string,
        noDataAvailable: string,
        noProfileChanges: string,
        numberMustBeAnInteger: string,
        orDropFilesHere: string,
        pleaseCheckYourEmailForConfirmation: string,
        pleaseCompleteTheForm: string,
        problemConfirmingLoginStatus: string,
        problemGettingDataFor: string,
        problemGettingInformationFromTheServer: string,
        problemLoadingTheForm: string,
        problemValidatingDate: string,
        problemSubmittingNewWorklog: string,
        problemWithDataSent: string,
        problemWithRegistrationData: string,
        profileInformation: string,
        readyToUpload: string,
        recordWasntFound: string,
        register: string,
        required: string,
        reset: string,
        rowsPerPage: string,
        submit: string,
        save: string,
        search: string,
        selectYourRequestPage: string,
        sessionHasExpired: string,
        somethingWentWrong: string,
        successfullyLoggedOut: string,
        successfullyUpdatedProfile: string,
        summary: string,
        theLoginFieldIsRequired: string,
        thereWasAProblemConfirmingYourRegistration: string,
        thereWasAProblemSendingTheConfirmationMessage: string,
        type: string,
        thereWasAnErrorCreatingTheRequest: string,
        unableToGetContentFromServer: string,
        updateProfile: string,
        websiteTitle: string,
        worklogs: string,
        firstName: string,
        lastName: string,
        emailAddress: string,
        phone: string,
        site: string,
        classWorklog: string,
        linkNoLongerValid: string,
        registrationTokenUnclaimed: string,
        registrationTokenExpired: string,
        registrationTokenDisabled: string,
        registrationContactSupport: string,
        remove: string
    ) {
        this.pageNotFound = pageNotFound;
        this.attributes = attributes;
        this.browse = browse;
        this.cancel = cancel;
        this.close = close;
        this.clear = clear;
        this.contactSupport = contactSupport;
        this.createdBy = createdBy;
        this.dateCreated = dateCreated;
        this.description = description;
        this.details = details;
        this.detailsTitle = detailsTitle;
        this.emailIsNotProperlyFormatted = emailIsNotProperlyFormatted;
        this.enterTheMissingInformation = enterTheMissingInformation;
        this.failedToLogOut = failedToLogOut;
        this.failedToSendEmail = failedToSendEmail;
        this.fileIsTooLarge = fileIsTooLarge;
        this.fileTypesMustBeOneOfTheFollowing = fileTypesMustBeOneOfTheFollowing;
        this.filesCantBeEmpty = filesCantBeEmpty;
        this.fileTypes = fileTypes;
        this.fixErrorsOnTheForm = fixErrorsOnTheForm;
        this.goBack = goBack;
        this.home = home;
        this.inquiryPage = inquiryPage;
        this.invalidLoginPleaseTryAgain = invalidLoginPleaseTryAgain;
        this.isRequired = isRequired;
        this.login = login;
        this.loginPlaceholderText = loginPlaceholderText;
        this.logout = logout;
        this.newWorklog = newWorklog;
        this.newWorklogAdded = newWorklogAdded;
        this.noDataAvailable = noDataAvailable;
        this.noProfileChanges = noProfileChanges;
        this.numberMustBeAnInteger = numberMustBeAnInteger;
        this.orDropFilesHere = orDropFilesHere;
        this.pleaseCheckYourEmailForConfirmation = pleaseCheckYourEmailForConfirmation;
        this.pleaseCompleteTheForm = pleaseCompleteTheForm;
        this.problemConfirmingLoginStatus = problemConfirmingLoginStatus;
        this.problemGettingDataFor = problemGettingDataFor;
        this.problemGettingInformationFromTheServer = problemGettingInformationFromTheServer;
        this.problemLoadingTheForm = problemLoadingTheForm;
        this.problemValidatingDate = problemValidatingDate;
        this.problemWithDataSent = problemWithDataSent;
        this.problemWithRegistrationData = problemWithRegistrationData;
        this.problemSubmittingNewWorklog = problemSubmittingNewWorklog;
        this.profileInformation = profileInformation;
        this.readyToUpload = readyToUpload;
        this.recordWasntFound = recordWasntFound;
        this.register = register;
        this.required = required;
        this.reset = reset;
        this.rowsPerPage = rowsPerPage;
        this.save = save;
        this.search = search;
        this.selectYourRequestPage = selectYourRequestPage;
        this.sessionHasExpired = sessionHasExpired;
        this.somethingWentWrong = somethingWentWrong;
        this.submit = submit;
        this.successfullyLoggedOut = successfullyLoggedOut;
        this.successfullyUpdatedProfile = successfullyUpdatedProfile;
        this.summary = summary;
        this.theLoginFieldIsRequired = theLoginFieldIsRequired;
        this.thereWasAProblemConfirmingYourRegistration = thereWasAProblemConfirmingYourRegistration;
        this.thereWasAProblemSendingTheConfirmationMessage = thereWasAProblemSendingTheConfirmationMessage;
        this.type = type;
        this.thereWasAnErrorCreatingTheRequest = thereWasAnErrorCreatingTheRequest;
        this.unableToGetContentFromServer = unableToGetContentFromServer;
        this.updateProfile = updateProfile;
        this.websiteTitle = websiteTitle;
        this.worklogs = worklogs;
        this.firstName = firstName;
        this.lastName = lastName;
        this.emailAddress = emailAddress;
        this.phone = phone;
        this.site = site;
        this.class = classWorklog;
        this.linkNoLongerValid = linkNoLongerValid;
        this.registrationTokenUnclaimed = registrationTokenUnclaimed;
        this.registrationTokenExpired = registrationTokenExpired;
        this.registrationTokenDisabled = registrationTokenDisabled;
        this.registrationContactSupport = registrationContactSupport;
        this.remove = remove;
    }
}

export function populateTranslations(translationObj: { [key: string]: string | number; }) {
    return new Translation(
        translationObj._404PageMessage as string,
        translationObj.attributes as string,
        translationObj.browse as string,
        translationObj.cancel as string,
        translationObj.close as string,
        translationObj.clear as string,
        translationObj.contactSupport as string,
        translationObj.createdBy as string,
        translationObj.dateCreated as string,
        translationObj.description as string,
        translationObj.details as string,
        translationObj.detailsTitle as string,
        translationObj.emailIsNotProperlyFormatted as string,
        translationObj.enterTheMissingInformation as string,
        translationObj.failedToLogOut as string,
        translationObj.failedToSendEmail as string,
        translationObj.fileIsTooLarge as string,
        translationObj.fileTypesMustBeOneOfTheFollowing as string,
        translationObj.fileTypes as string,
        translationObj.filesCantBeEmpty as string,
        translationObj.fixErrorsOnTheForm as string,
        translationObj.goBack as string,
        translationObj.home as string,
        translationObj.inquiryPage as string,
        translationObj.invalidLoginPleaseTryAgain as string,
        translationObj.isRequired as string,
        translationObj.login as string,
        translationObj.loginPlaceholderText as string,
        translationObj.logout as string,
        translationObj.newWorklog as string,
        translationObj.newWorklogAdded as string,
        translationObj.noDataAvailable as string,
        translationObj.noProfileChanges as string,
        translationObj.numberMustBeAnInteger as string,
        translationObj.orDropFilesHere as string,
        translationObj.pleaseCheckYourEmailForConfirmation as string,
        translationObj.pleaseCompleteTheForm as string,
        translationObj.problemConfirmingLoginStatus as string,
        translationObj.problemGettingDataFor as string,
        translationObj.problemGettingInformationFromTheServer as string,
        translationObj.problemLoadingTheForm as string,
        translationObj.problemValidatingDate as string,
        translationObj.problemSubmittingNewWorklog as string,
        translationObj.problemWithDataSent as string,
        translationObj.problemWithRegistrationData as string,
        translationObj.profileInformation as string,
        translationObj.readyToUpload as string,
        translationObj.recordWasntFound as string,
        translationObj.register as string,
        translationObj.required as string,
        translationObj.reset as string,
        translationObj.rowsPerPage as string,
        translationObj.submit as string,
        translationObj.save as string,
        translationObj.search as string,
        translationObj.selectYourRequestPage as string,
        translationObj.sessionHasExpired as string,
        translationObj.somethingWentWrong as string,
        translationObj.successfullyLoggedOut as string,
        translationObj.successfullyUpdatedProfile as string,
        translationObj.summary as string,
        translationObj.theLoginFieldIsRequired as string,
        translationObj.thereWasAProblemConfirmingYourRegistration as string,
        translationObj.thereWasAProblemSendingTheConfirmationMessage as string,
        translationObj.type as string,
        translationObj.thereWasAnErrorCreatingTheRequest as string,
        translationObj.unableToGetContentFromServer as string,
        translationObj.updateProfile as string,
        translationObj.websiteTitle as string,
        translationObj.worklogs as string,
        translationObj.firstName as string,
        translationObj.lastName as string,
        translationObj.emailAddress as string,
        translationObj.phone as string,
        translationObj.site as string,
        translationObj.class as string,
        translationObj.linkNoLongerValid as string,
        translationObj.registrationTokenUnclaimed as string,
        translationObj.registrationTokenExpired as string,
        translationObj.registrationTokenDisabled as string,
        translationObj.registrationContactSupport as string,
        translationObj.remove as string
    );
}