<template>
  <v-container
    id="registration-container"
    align-center
    justify-center
  >
    <v-row>
      <v-card
        id="registration-card"
        class="mx-auto"
        width="550"
      >
        <v-toolbar color="grey darken-3">
          <v-toolbar-title class="white--text headline">
            {{ registrationTitle }}
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
          id="registration-form"
          v-if="pageInputs.length > 0"
          page-data-url="person/GetNewPersonPageData"
          dropdown-data-url="person/GetNewPersonDropdownData"
          dependencies-url="person/GetNewPersonDependenciesObject"
          update-url="objectRequest/UpdateMaximoObjectContext"
          lookup-table-data-url="person/GetNewPersonTableData"
          page-type="UserProfile"
          :page-inputs="pageInputs"
          :multi-part-relationships="multiPartRelationships"
          :is-editing="true"
          @input-error="updateInputError"
          @enterKeyPressed="enterKeyPressed"
          :form-id="formId"
          :translations="getTranslations"
        />

        <v-card-actions id="registration-buttons-container">
          <v-container class="text-center justify-center flex-button-container">
            <v-btn
              id="cancel-registration-button"
              class="flex-button"
              color="blue darken-3 white--text"
              large
              to="/"
            >
              {{ translations.cancel }}
            </v-btn>
            <v-btn
              id="submit-registration-button"
              color="blue darken-3 white--text"
              class="flex-button"
              large
              @click.native="submit"
            >
              {{ translations.submit }}
            </v-btn>
          </v-container>
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
import Vue from "vue";
import InputForm from "./InputForm.vue";
import InputNote from "./InputNote.vue";
import { InputBase } from "./../../models/InputBase";
import { 
  mapActions,
  mapGetters,
  mapMutations
} from "vuex";
import * as shared from "./../../services/SharedFunctions";
import { AddPageInputs } from "./../../services/MatchInputs";
import { 
  SnackbarBody,
  SnackbarColors,
  InputPageResult
} from "./../../models/MiscTypes";
import axios, { AxiosResponse, AxiosError } from "axios";
import Wraxios from "./../../services/Wraxios";
import { MultipleMarkdown } from "../../models/MarkDown";
import { Translations } from "./../../translations/Translations";
import { handleNoPageInputs } from "./../../services/ComponentHelpers";

const matchInputs = new AddPageInputs();
const wraxios = new Wraxios();

export default Vue.extend({
  components: {
    "input-form": InputForm,
    "input-note": InputNote
  },
  data() {
    return {
      registrationTitle: "" as string, // Translation should be provided by the server
      pageInputs: [] as InputBase[],
      inputError: false as boolean,
      multiPartRelationships: {},
      formId: "" as string,
      notesAtTopOfPage: {} as MultipleMarkdown,
      notesAtBottomOfPage: {} as MultipleMarkdown
    };
  },
  computed: {
    ...mapGetters({
      translations: "get_translations",
      getRequestBody: "get_newRequestBody"
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
      showOverlay: "set_showOverlay",
      updateRequestBody: "update_newRequestBody"
    }),
    async onload() {
      this.formId = shared.generateFormId(this.$router);
      shared.setButtonWidth("flex-button");
      this.setDefaultRequestBody();
      this.showOverlay(true);

      await wraxios.post(
        axios,
        "account/registration",
        {},
        {
          400: this.wraxiosError,
          500: this.wraxiosError
        }
      );

      this.pageInputs = [];
      matchInputs.pageInputs = [];

      await wraxios.get(
        axios,
        "person/GetNewPersonPageData",
        {
          200: this.getNewPersonPageDataSuccess,
          400: this.wraxiosError,
          500: this.wraxiosError
        }
      );
    },
    // eslint-disable-next-line
    wraxiosError(error: AxiosError) {
      this.showOverlay(false);
      this.showSnackbar({
        text: error.response?.data || this.getTranslations.unableToGetContentFromServer,
        color: SnackbarColors.error
      } as SnackbarBody);
    },
    getNewPersonPageDataSuccess(response: AxiosResponse) {
      const result = response.data as InputPageResult;

      if (result.inputs.length < 1) {
        handleNoPageInputs(this.getTranslations.problemLoadingTheForm, this.$router);   
        return;
      }

      this.registrationTitle = result.title;
      
      matchInputs.addInput(result.inputs);
      this.pageInputs = matchInputs.pageInputs;
      this.notesAtTopOfPage = result.notesAtTopOfPage;
      this.notesAtBottomOfPage = result.notesAtBottomOfPage;

      this.multiPartRelationships = result.multiPartRelationships;

      this.updateRequestBody([this.formId, result.defaultValues]);        
      this.showOverlay(false);
    },
    enterKeyPressed() {
      this.submit();
    },
    async submit() {
      if (Object.keys(this.getRequestBody[this.formId]).length < 1) {
        this.showSnackbar({
          text: this.getTranslations.pleaseCompleteTheForm,
          color: SnackbarColors.warn
        });

        return;
      }

      if (this.inputError === true) {
        this.showSnackbar({
          text: this.getTranslations.fixErrorsOnTheForm,
          color: SnackbarColors.error
        } as SnackbarBody);

      return;
      }

      const missingInputsResult = this.checkForMissingInputs();

      if (missingInputsResult !== "") {
        return;
      } else {
        await this.submitRegistration();
      }
    },
    async submitRegistration() {
      this.showOverlay(true);
      const formData = this.getRequestBody[this.formId];
      const url = "person/NewPersonConfirmation";

      await wraxios.post(
        axios,
        url,
        formData,
        {
          204: this.newPersonConfirmationSuccess,
          400: this.newPersonConfirmationFailure,
          500: this.newPersonConfirmationFailure
        }
      );
    },
    // eslint-disable-next-line
    newPersonConfirmationSuccess(response: AxiosResponse) {
      const snackbarBody: SnackbarBody = {
        text: this.getTranslations.pleaseCheckYourEmailForConfirmation,
        color: SnackbarColors.info
      };
      this.showSnackbar(snackbarBody);
      this.showOverlay(false);
      this.$router.push("/");
    },
    newPersonConfirmationFailure(error: AxiosError) {
      this.showOverlay(false);
      this.showSnackbar({
        text: error.response?.data || this.getTranslations.registrationContactSupport,
        color: SnackbarColors.error
      } as SnackbarBody);
        const updatedInputs = shared.badInput(
          error,
          this.pageInputs,
          this.formId
        );

        if (!shared.arraysAreSameLength(
          updatedInputs,
          this.pageInputs,
          this.getTranslations.problemWithRegistrationData
        )) {
          return;
        }
        
        // The pageInputs object has to be refreshed in order for
        // the inputs to pick up on changes to the isErrorState 
        // property. 
        this.pageInputs = updatedInputs as InputBase[];
    },
    checkForMissingInputs() {
      return shared.checkForMissingInputs(this.pageInputs, this.formId);
    },
    updateInputError(e: boolean) {
      this.inputError = e;
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

#registration-form {
  padding-bottom: 0;
  padding-top: 0;
}

#registration-buttons-container {
  padding: 0 5%;
}

#registration-card {
  margin: 30px 0;
  max-width: calc(100% - 24px);

  @include sm-max {
    margin: 0;
  }
}

</style>