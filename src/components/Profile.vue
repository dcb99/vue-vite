<template>
  <v-container
    id="profile-container"
    align-center
    justify-center
  >
    <v-row>
      <v-card 
        id="profile-card"
        class="mx-auto"
        width="550"
      >
        <v-toolbar color="grey darken-3">
          <v-toolbar-title
            class="white--text"
            headline
          >
            {{ inputFormTitle }}
          </v-toolbar-title>
          <v-spacer />
        </v-toolbar>
        <v-container class="note-container note-container-top" v-if="notesAtTopOfPage && Object.keys(notesAtTopOfPage).length > 0">
          <input-note
            v-for="(markdown, index) in notesAtTopOfPage"
            :key="index"
            :multiple-markdown="markdown"
          />
        </v-container>
        <input-form
          v-if="pageInputs.length >= 1"
          id="profile-input-form"
          :key="reload"
          update-url="/person/UpdatePersonData"
          dependencies-url="/objectRequest/GetDependencies"
          dropdown-data-url="/formsData/GetDropdownData"
          lookup-table-data-url="/formsData/GetLookupTableData"
          page-type="UserProfile"
          :disabled="initialButtonsVisible"
          :is-editing="isEditingProfile"
          :page-inputs="pageInputs"
          :multi-part-relationships="multiPartRelationships"
          :form-id="formId"
          @loaded="disableInputs"
          @enterKeyPressed="saveProfileChanges"
          :translations="getTranslations"
        />

        <v-card-actions class="text-center">
          <v-row
            id="profile-buttons-container"
            align-center
            justify-center
            class="flex-button-container justify-center text-center"
          >
            <v-btn
              v-if="initialButtonsVisible"
              id="profile-go-back-button"
              color="blue darken-3"
              class="flex-button initial-buttons white--text"
              large
              @click.native="goBack"
              >{{ translations.goBack }}</v-btn
            >
            <v-btn
              v-if="initialButtonsVisible"
              id="update-profile-button"
              class="flex-button intial-buttons white--text"
              color="blue darken-3"
              large
              @click.native="enableEditMode"
              >{{ translations.updateProfile }}</v-btn
            >
            <v-btn
              v-if="!initialButtonsVisible"
              id="cancel-update-button"
              class="flex-button intial-buttons white--text"
              color="blue darken-3"
              large
              @click.native="cancelUpdate"
              >{{ translations.cancel }}</v-btn
            >
            <v-btn
              v-if="!initialButtonsVisible"
              id="save-changes-button"
              class="flex-button white--text"
              color="blue darken-3"
              large
              :loading="buttonLoading"
              @click.native="saveProfileChanges"
              >{{ translations.save }}</v-btn
            >
          </v-row>
        </v-card-actions>
        <v-container class="note-container" v-if="notesAtBottomOfPage && Object.keys(notesAtBottomOfPage).length > 0">
          <input-note
            v-for="(markdown, index) in notesAtBottomOfPage"
            :key="index"
            :multiple-markdown="markdown"
          />
        </v-container>
      </v-card>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import InputForm from "./InputForm.vue";
import InputNote from "./InputNote.vue";
import { InputBase } from "./../../models/InputBase";
import Vue from "vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
import * as shared from "./../../services/SharedFunctions";
import { 
  PersonModel,
  SnackbarBody,
  SnackbarColors,
  InputPageResult, 
  RequestBodyErrorPayload} from "./../../models/MiscTypes";
import { AddPageInputs } from "./../../services/MatchInputs";
import isEqual from "lodash/isEqual";
import axios, { AxiosResponse, AxiosError } from "axios";
import Wraxios from "./../../services/Wraxios";
import { cloneDeep } from "lodash";
import { MultipleMarkdown } from "../../models/MarkDown";
import { Translations } from "./../../translations/Translations";
import { handleNoPageInputs } from "./../../services/ComponentHelpers";

const wraxios = new Wraxios();
const matchInputs = new AddPageInputs();

export default Vue.extend({
  components: {
    "input-form": InputForm,
    "input-note": InputNote
  },
  data() {
    return {
      isLoading: false as boolean,
      initialButtonsVisible: true as boolean,
      title: "" as string,
      reload: false as boolean,
      buttonLoading: false as boolean,
      isEditingProfile: false as boolean,
      pageInputs: [] as InputBase[],
      inputFormTitle: "" as string,
      multiPartRelationships: {},
      formId: "" as string,
      originalRequestBody: {},
      notesAtTopOfPage: {} as MultipleMarkdown,
      notesAtBottomOfPage: {} as MultipleMarkdown
    };
  },
  computed: {
    ...mapGetters({
      translations: "get_translations",
      getMissingRequired: "get_missingRequiredAttributes",
      getRequestBody: "get_newRequestBody"
    }),
    getTranslations(): Translations {
      return this.translations;
    }
  },
  async beforeMount() {  
    await this.onload();

      // If any required person attributes are missing, set
      // the input form to be editable and show a message to
      // the user letting them know that their profile is 
      // missing required information.
      if (this.getMissingRequired.length > 0) {
        this.missingRequiredAttributes();        
      }
     
      shared.setButtonWidth("profile-update-buttons");
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      setMissingRequired: "set_missingRequiredAttributes",
      setDefaultRequestBody: "set_defaultRequestBody",
      showOverlay: "set_showOverlay",
      setUserData: "set_userData",
      setUserAuthentication: "set_userIsAuthenticated",
      setSessionHash: "set_userSessionHash",
      updateNewRequestBody: "update_newRequestBody",
      setNewRequestBodyErrors: "set_newRequestBodyErrors"
    }),
    enableEditMode() {
      this.isEditingProfile = true;
      this.initialButtonsVisible = false;
    },
    missingRequiredAttributes() {      
      this.getMissingRequired.forEach((maxAttribute: string) => {
        const errorPayload = {
          formId: this.formId,
          payload: { [maxAttribute]: true}
        } as RequestBodyErrorPayload;
          this.setNewRequestBodyErrors(errorPayload);  
      });

      this.showSnackbar({
        text: this.getTranslations.enterTheMissingInformation,
        color: SnackbarColors.error
      } as SnackbarBody);
      this.enableEditMode();
    },
    disableInputs(event: {[key: string]: string}) {
      shared.setButtonWidth("profile-update-buttons");
      this.title = event.title;
    },
    handleError(error: AxiosError) {
      this.$nextTick(() => this.showSnackbar({
        text: error.response?.data || this.getTranslations.problemLoadingTheForm,
        color: SnackbarColors.error
      } as SnackbarBody));
      
      this.$router.go(-1);

      return;
    },
    setPageInputs(response: AxiosResponse) {
      const result = response.data as InputPageResult;

      if (result.inputs.length < 1) {
        handleNoPageInputs(this.getTranslations.problemLoadingTheForm, this.$router);
        return;
      }

      this.multiPartRelationships = result.multiPartRelationships;

      result.inputs.forEach(input => {
        input.isErrorState = false;
      });
      this.inputFormTitle = result.title;
      matchInputs.addInput(result.inputs);
      
      this.pageInputs = matchInputs.pageInputs;
      this.notesAtTopOfPage = result.notesAtTopOfPage;
      this.notesAtBottomOfPage = result.notesAtBottomOfPage;

      // We have to build out a new request body and update it with the current inputs/values
      // so that the watchers on the inputs do not read the newRequestBody inputs as empty
      // and reassign empty values to the inputs on updating
      const newRequestBody = {} as Record<string, string>;

      matchInputs.pageInputs.filter(x => x.defaultValue !== "").forEach(input => {
        newRequestBody[input.maxAttribute] = input.defaultValue;
      });

      this.updateNewRequestBody([this.formId, newRequestBody]);
      this.originalRequestBody = cloneDeep(newRequestBody);
      this.showOverlay(false);
    },
    async onload() {
      this.formId = shared.generateFormId(this.$router);
      this.setDefaultRequestBody();
      this.showOverlay(true);
      this.clearInputArrays();
      const url = "/person/GetProfilePageData";      
      const callbacks = {
          200: this.setPageInputs,
          400: this.handleError
      };

      await wraxios.get(
        axios,
        url,
        callbacks as {[key: number]: Function});
    },
    goBack() {
      this.$router.push("/LandingPage");
    },
    noProfileChanges() {
      this.showSnackbar({
        text: this.getTranslations.noProfileChanges,
        color: SnackbarColors.info
      } as SnackbarBody);
      return;
    },
    //eslint-disable-next-line
    async saveProfileChangesOk(response: AxiosResponse) {
      const data = response.data as PersonModel;
      this.setUserData(data.personAttributes);

      this.showSnackbar( {
        text: this.translations.successfullyUpdatedProfile,
        color: SnackbarColors.success
      } as SnackbarBody);
      
      await this.cancelUpdate();
      return;
    },
    handleBadInput(response: AxiosError) {
      shared.badInput(response, this.pageInputs, this.formId);
    },
    handleCommTemplateFailure(error: AxiosError) {
      this.showSnackbar({
        text: error.response?.data,
        color: SnackbarColors.warn
      } as SnackbarBody);
    },
    async saveProfileChanges(): Promise<void> {
      const noChangesSnackbar = {
        text: this.getTranslations.noProfileChanges,
        color: SnackbarColors.warn
      } as SnackbarBody;

      const missingInputsResult = this.checkForMissingInputs();

      if (missingInputsResult !== "") {
        return;
      }     

      if (Object.keys(this.getRequestBody[this.formId]).length < 1
        || !!this.noProfileChangesMade()) {
        this.showSnackbar(noChangesSnackbar);
        return;
      }    

      this.showOverlay(true);
      const url = "person/savePersonRecord";
      const formData = this.getRequestBody[this.formId];

      const callbacks = {
        200: this.saveProfileChangesOk,
        204: this.noProfileChanges,
        400: this.handleBadInput,
        501: this.handleCommTemplateFailure
      };

      await wraxios.post(
        axios,
        url,
        formData,
        callbacks
      );

      this.setMissingRequired([]);
      await this.checkMissingRequiredAttributes();
    },
    // eslint-disable-next-line
    hasMissingAttributes(response: AxiosResponse) {
      // If there are any required attributes on the person record that are missing,
      // redirect to the profile page so the user can add the missing info.
      const missingAttributes = [] as string[];

      if (response.data.length > 0) {
        response.data.forEach((x: string) => missingAttributes.push(x));
      } else {
        return;
      }

      this.setMissingRequired(missingAttributes);
    },
    async checkMissingRequiredAttributes() {
      const callbacks = {
        200: this.hasMissingAttributes
      };

      await wraxios.get(
        axios,
        "person/getMissingRequired",
        callbacks
      );
    },
    async cancelUpdate() {
      this.initialButtonsVisible = true;
      this.isEditingProfile = false;
      await this.onload();
    },
    clearInputArrays() {
      this.pageInputs = [];
      matchInputs.pageInputs = [];
    },
    noProfileChangesMade(): boolean {
      const profileChanges = this.getRequestBody[this.formId];
      return isEqual(this.originalRequestBody, profileChanges);
    },
    checkForMissingInputs() {
      return shared.checkForMissingInputs(this.pageInputs, this.formId);
    },
  }
});
</script>

<style lang="scss" scoped>
@import "@/scss/components/_button-container";

.note-container {
  &.note-container-top {
    padding-bottom: 0;
  }
  padding-left: 30px;
  padding-right: 30px;
  margin-top: 10px;
}

#profile-input-form {
  padding-bottom: 0;
  padding-top: 0;
}

#profile-buttons-container {
  padding: 0 6%;
}

#profile-card {
  margin: 30px 0;
  max-width: calc(100% - 24px);

  @include sm-max {
    margin: 0;
  }
}

</style>
