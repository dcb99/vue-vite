<template>
  <v-container id="new-request-container" class="text-xs-center mx-auto">
    <v-row align-center justify-center>
      <v-col
        cols="3"
        offset-md="1"
        class="hidden-md-and-down"
        v-if="!hideProfileCard"
      >
        <v-card id="request-card">
          <v-toolbar class="white--text" color="grey darken-3">
            <v-toolbar-title>
              {{ translations.profileInformation }}
            </v-toolbar-title>
            <v-spacer />
            <v-icon color="orange lighten-2">person</v-icon>
          </v-toolbar>

          <v-row>
            <v-form id="new-request-profile-data">              
                <v-text-field
                  :value="getUserData['firstname']"
                  aria-labelledby="first name"
                  class="custom-vue-input"
                  readonly
                >
                  <template v-slot:label>
                    <p class="person-info-label">
                      {{ translations.firstName }}
                    </p>
                  </template>
                </v-text-field>

                <v-text-field
                  :value="getUserData['lastname']"
                  aria-labelledby="last name"
                  class="custom-vue-input"
                  readonly
                >
                  <template v-slot:label>
                    <p class="person-info-label">{{ translations.lastName }}</p>
                  </template>
                </v-text-field>

                <v-text-field
                  :value="getUserData['primaryemail']"
                  aria-labelledby="email address"
                  class="custom-vue-input"
                  readonly
                >
                  <template v-slot:label>
                    <p class="person-info-label">
                      {{ translations.emailAddress }}
                    </p>
                  </template>
                </v-text-field>
             
                <v-text-field
                  :value="getUserData['primaryphone']"
                  aria-labelledby="phone number"
                  class="custom-vue-input"
                  readonly
                >
                  <template v-slot:label>
                    <p class="person-info-label">{{ translations.phone }}</p>
                  </template>
                </v-text-field>

                <v-text-field
                  :value="getUserData['locationsite']"
                  aria-labelledby="user site"
                  class="custom-vue-input"
                  readonly
                >
                  <template v-slot:label>
                    <p class="person-info-label">{{ translations.site }}</p>
                  </template>
                </v-text-field>
            </v-form>
          </v-row>
        </v-card>
      </v-col>

      <v-col
       id="request-content"
       cols="12"
       lg="7"
      >
        <v-card id="new-request-card">
          <v-toolbar
            id="new-request-toolbar"
            class="white--text"
            color="grey darken-3"
          >
            <v-toolbar-title id="new-request-title">{{ title }}</v-toolbar-title>
          </v-toolbar>
          <v-container class="note-container note-container-top" v-if="notesAtTopOfPage && Object.keys(notesAtTopOfPage).length > 0">
            <input-note
              v-for="(markdown, index) in notesAtTopOfPage"
              :key="index"
              :multiple-markdown="markdown"
            />
          </v-container>
          <input-form
            id="new-request-input-form"
            class="mx-auto"
            v-if="pageInputs.length >= 1"
            :page-inputs="pageInputs"
            :multi-part-relationships="multiPartRelationships"
            dropdown-data-url="formsData/getDropdownData"
            lookup-table-data-url="formsData/getLookupTableData"
            dependencies-url="objectRequest/getDependencies"
            update-url="objectRequest/updateMaximoObjectContext"
            page-type="NewMaximoObject"
            :disabled="false"
            :is-editing="true"
            :form-id="formId"
            @enterKeyPressed="submitForm"
            :translations="getTranslations"
          />

          <v-card-actions>
            <v-row id="new-request-buttons-container" class="text-center justify-center flex-button-container">
              <v-btn
                id="cancel-request-button"
                class="flex-button"
                large
                color="blue darken-3 white--text"
                @click="goBack"
              >
                {{ translations.goBack }}
              </v-btn>

              <v-btn
                id="submit-request-button"
                large
                class="flex-button"
                color="blue darken-3 white--text"
                @click="submitForm"
              >
                {{ translations.submit }}
              </v-btn>
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { 
  mapActions,
  mapGetters,
  mapMutations
} from "vuex";
import { InputBase } from "./../../models/InputBase";
import { 
  SnackbarBody,
  SnackbarColors,
  InputPageResult,
  NewRequestResponse
} from "./../../models/MiscTypes";
import InputForm from "./InputForm.vue";
import * as shared from "./../../services/SharedFunctions";
import Wraxios from "./../../services/Wraxios";
import { AddPageInputs } from "./../../services/MatchInputs";
import axios, { AxiosResponse, AxiosError } from "axios";
import { MultipleMarkdown } from "../../models/MarkDown";
import InputNote from "./InputNote.vue";
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
      pageInputs: [] as InputBase[],
      userData: {} as {[key: string]: string},
      title: "" as string,
      multiPartRelationships: {},
      formId: "" as string,
      hideProfileCard: false as boolean,
      notesAtTopOfPage: {} as MultipleMarkdown,
      notesAtBottomOfPage: {} as MultipleMarkdown
    };
  },
  computed: {
    ...mapGetters({
      translations: "get_translations",
      getRequestBody: "get_newRequestBody",
      getUserData: "get_userData"
    }),
    getTranslations(): Translations {
      return this.translations;
    }
  },
  async beforeMount() {
    await this.onload();
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      setDefaultRequestBody: "set_defaultRequestBody",      
      updateNewRequestBody: "update_newRequestBody",      
      showOverlay: "set_showOverlay",
      setDiscrepancies: "set_discrepancies",
      resetSearchDependencies: "resetLookupTableSearchDependencies"
    }),
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
      this.title = result.title;
      matchInputs.addInput(result.inputs);

      this.pageInputs = matchInputs.pageInputs;
      this.notesAtTopOfPage = result.notesAtTopOfPage;
      this.notesAtBottomOfPage = result.notesAtBottomOfPage;
      this.hideProfileCard = result.hideProfileData;

      // We have to build out a new request body and update it with the current inputs/values
      // so that the watchers on the inputs do not read the newRequestBody inputs as empty
      // and reassign empty values to the inputs on updating

      this.updateNewRequestBody([this.formId, result.defaultValues]);
      this.showOverlay(false);
    },
    handleBadInput(response: AxiosError) {
      shared.badInput(response, this.pageInputs, this.formId);
    },
    onloadFailure(error: AxiosError) {
      this.$nextTick(() => {
        this.showSnackbar({
          text: error.response?.data || this.getTranslations.problemGettingInformationFromTheServer,
          color: SnackbarColors.error
        } as SnackbarBody);
      });     
      this.showOverlay(false);
    },
    async onload() {
      this.formId = shared.generateFormId(this.$router);
      this.pageInputs = [];
      matchInputs.pageInputs = [];
      this.setDefaultRequestBody();
      this.resetSearchDependencies();
      this.showOverlay(true);
      const pageInputsUrl = `/objectRequest/getNewRequestPageData?pageName=${shared.getPageName(this.$route)}`;
      const callbacks = {
        200: this.setPageInputs,
        400: this.onloadFailure
      };

      await wraxios.get(
        axios,
        pageInputsUrl,
        callbacks
      );
    },
    goBack() {
      this.$router.go(-1);
    },
    successfulSubmission(responseObj: NewRequestResponse) {
      this.setDiscrepancies(responseObj.discrepancies);
      const url = 
        `/editPage?pageName=${responseObj.editPageName}&editPageLookupNumber=${responseObj.uniqueId}&submissionResult=true&formId=${this.formId}`;
      this.$router.push(url);
    },
    handleCommTemplateFailure(error: AxiosError) {
      // Comm template failures don't indicate a failure to create a request but we do need
      // to let the user know the message failed to send.
      this.showSnackbar({
        text: error.response?.data.failureMessage,
        color: SnackbarColors.warn
      } as SnackbarBody);

      const responseObj = {
        editPageName: error.response?.data.editPageName,
        uniqueId: error.response?.data.uniqueId,
        originalSnapshot: error.response?.data.originalSnapshot[0]
      } as NewRequestResponse;
      
      this.successfulSubmission(responseObj);      
    },
    submitSuccess(response: AxiosResponse) {
      const responseObj = {
        editPageName: response.data.editPageName,
        uniqueId: response.data.uniqueId,
        originalSnapshot: response.data.originalSnapshot,
        discrepancies: response.data.discrepancies
      } as NewRequestResponse;
      this.successfulSubmission(responseObj);
    },
    submitFailure(error: AxiosError) {
      this.showOverlay(false);
      
      if (error.response?.data) {
          shared.badInput(
          error,
          this.pageInputs,
          this.formId,
          error.response?.data  || this.getTranslations.fixErrorsOnTheForm
        );
      } else {
        this.showSnackbar({
          color: SnackbarColors.error,
          text: this.getTranslations.somethingWentWrong
        } as SnackbarBody);
      }     
    },
    async submitForm() {
      if (shared.checkForMissingInputs(this.pageInputs, this.formId) !== "") {
        return;
      }

      if (Object.values(this.getRequestBody[this.formId]).every(x => x === "")) {
        this.showSnackbar({
          text: this.getTranslations.pleaseCompleteTheForm,
          color: SnackbarColors.warn
        } as SnackbarBody);

        return;
      }

      const callbacks = {
        200: this.submitSuccess,
        400: this.submitFailure,
        501: this.handleCommTemplateFailure
      };
     
      this.showOverlay(true);
      await wraxios.post(
        axios,
        `/objectRequest/CreateMaximoObject?pageName=${shared.getPageName(this.$route)}`,
        this.getRequestBody[this.formId],
        callbacks
      );
    }
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

#new-request-container {
  padding: 0;
  margin: 30px 0;
  max-width: calc(100% - 24px);

  @include rwd-max(1263) {
    margin: 0;
  }
}

#new-request-profile-data {
  padding: 4% 8% 0;
  width: 100%;
}

#new-request-buttons-container {
  padding: 0 8%;

  @include md {
    padding: 0 14%;
  }
}

#new-request-input-form {
  width: 100%;
  padding-bottom: 0;
  padding-top: 0;

  @include md {
    width: 80%;
  }
}

</style>