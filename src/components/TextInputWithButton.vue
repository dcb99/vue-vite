<template>
  <v-container
    class="pa-2 text-xs-center"
    align-center
    justify-center
  >
    <v-row>
      <label
        :id="labelId"
        :for="inputData.maxAttribute"
        :class="['input-label', {'orange--text': isHighlighted}]"
      >
        {{ labelText }}
      </label>
    </v-row>

    <v-row class="custom-text-input my-n7">
      <v-col cols="12">
        <div :id="`${inputData.maxAttribute}-border-${formId}`">
          <v-text-field
            :id="`${inputData.maxAttribute}-input-${formId}`"
            :class="['custom-vue-input', {'input-highlight': isHighlighted}]"
            v-model="inputValue"
            :max-length="inputData.maxLength"
            :readonly="isReadOnly"
            @change="updateInput"
            @click:append="lookupInputData"
            :append-icon="appendIcon"
            :error="isErrorState"
            :disabled="isDisabled"
            @keyup.enter="enterKeyPressed"
          />          
        </div>        
      </v-col>
    </v-row>
  </v-container> 
</template>

<script lang="ts">
import Vue from "vue";
import {
  mapActions,
  mapMutations,
  mapGetters
} from "vuex";
import * as shared from "./../../services/SharedFunctions";
import { TextInputWithButton } from "./../../models/Classes";
import { 
  GetLookupTableInput,
  UpdateInputRequest,
  SnackbarBody,
  SnackbarColors,
  SearchDependenciesArgs,
  PageTypes
} from "./../../models/MiscTypes";
import { AxiosError } from "axios";
import { Translations } from "./../../translations/Translations";
import { storeHasValueForInput } from "./../../services/ComponentHelpers";

export default Vue.extend({
  props: {
    inputData: {
      type: Object as () => TextInputWithButton,
      required: true
    },
    isEditing: Boolean,
    pageType: {
      type: String,
      required: true
    },
    lookupTableUrl: {
      type: String,
      required: true
    },
    updateUrl: {
      type: String,
      required: true
    },
    formId: {
      type: String,
      required: true
    },
    isHighlighted: {
      type: Boolean,
      default: false
    },
    translations: {
      type: Object as () => Translations,
      required: true
    }
  },
  data() {
    return {
      inputValue: "" as string,
      isReadOnly: false as boolean,
      appendIcon: "search" as string,
      isErrorState: false as boolean,
      pageName: "" as string,
      labelText: "" as string,
      isDisabled: false as boolean,
      labelId: "" as string
    };
  },
  beforeMount() {
    this.labelId = `${this.formId}${this.inputData.maxAttribute}`;
    this.labelText = 
      (!!this.isEditing && this.inputData.rules.required)
        ? `${this.inputData.label} (${this.translations.required})`
        : this.inputData.label;
    this.isDisabled = !shared.allDependenciesHaveValues(this.inputData.dependencies as string[], this.formId);
    this.onload(); 
  },
  computed: {
    ...mapGetters({
      getRequestBody: "get_newRequestBody",
      getNewRequestBodyErrors: "get_newRequestBodyErrors",
      lookupTableData: "get_lookupTableData"
    })
  },
  watch: {
    isEditing() {
      if (this.isEditing === true) {
        if(!this.inputData.rules.readOnly as boolean) {
          this.isReadOnly = false;
          this.appendIcon = "search";
        }

        if (!!this.inputData.rules.required) {
          this.labelText = `${this.inputData.label} (${this.translations.required})`;
        }
      }
    },
    getRequestBody: {
      deep: true,
      handler() {
        const maxAttribute = this.inputData.maxAttribute;

        if ( storeHasValueForInput(this.formId, maxAttribute)
          && this.getRequestBody[this.formId][maxAttribute] !== this.inputValue) {
          shared.removeErrorState(this);
          this.inputValue = this.getRequestBody[this.formId][maxAttribute];      
        } else if (this.getRequestBody[this.formId]
          && !this.getRequestBody[this.formId][maxAttribute]) {
            shared.removeErrorState(this);
            this.inputValue = "";
        }

        this.isDisabled = !shared.allDependenciesHaveValues(this.inputData.dependencies as string[], this.formId);
      }
      
    },
    getNewRequestBodyErrors: {
      deep: true,
      handler() {
        this.isErrorState = shared.isComponentError(this.inputData.maxAttribute, this.formId);
      }
    }
  },
  methods: {
    ...mapActions({
      textInputLookup: "textInputLookup",
      updateInputData: "updateInputData",
      showSnackbar: "do_showSnackbar",
    }),
    ...mapMutations({
      updateRequestBody: "update_newRequestBody",
      setSearchDependencies: "set_lookupTableSearchDependencies"
    }),
    async onload() {
      // If the input is part of the user profile, its default state
      // will be readonly, so the search icon shouldn't be displayed.
      if (this.$route.path === "/UserProfile") {
        this.appendIcon = "";
      }

      this.isReadOnly = this.inputData.rules.readOnly as boolean;

      if (!this.isReadOnly) {
        // If the URL path indicates we're on the profile page, the inputs
        // should be set to readonly.
        this.isReadOnly = shared.isProfilePagePath(this.$route.path);     
      }

      const maxAttribute = this.inputData.maxAttribute;

      if (storeHasValueForInput(this.formId, maxAttribute)) {
        this.inputValue = this.getRequestBody[this.formId][maxAttribute];      
      }

      this.pageName = shared.getPageName(this.$route);

      await this.$nextTick(() => {
        if (this.inputData.searchDependencies !== null) {
          this.setSearchDependencies(
            {
              formId: this.formId,
              maxAttribute: this.inputData.maxAttribute,
              searchDependencies: this.inputData.searchDependencies
            } as SearchDependenciesArgs
          );
        }
      });
    },
    lookupInputData() {
      let searchParams = {} as {[key: string]: string};

      if (this.inputData.searchDependencies?.defaultFilters?.getValueFrom) {
        searchParams = this.populateGetValueFrom();
      }

      this.$emit("textInputLookup", {
          maxAttribute: `${this.inputData.maxAttribute}-input`,
          pageType: this.pageType,
          pageName: this.pageName,
          lookupTableUrl: this.lookupTableUrl,
          formId: this.formId,
          searchParams: searchParams
        } as GetLookupTableInput
      );
    },
    populateGetValueFrom() {
      const searchParams = {} as {[key: string]: string};
      const getValueFrom = this.inputData.searchDependencies?.defaultFilters?.getValueFrom;
      const requestBody = {} as {[key: string]: string};
      
      for (const [key, value] of Object.entries(this.getRequestBody[this.formId])) {
        if (value !== "") {
          requestBody[key] = value as string;
        }
      };

      if (getValueFrom) {
          getValueFrom.forEach(item => {
            searchParams[item] = requestBody[item];
        });
      }

      return searchParams;
    },
    // eslint-disable-next-line
    handle501(error: AxiosError) {
      this.$nextTick(() => this.showSnackbar({
        text: `${this.inputData.maxAttribute} - ${error.response?.data || this.translations.problemWithDataSent}`,
        color: SnackbarColors.error
      } as SnackbarBody));

      shared.setErrorState(this);
    },
    // eslint-disable-next-line
    badRequest(error: AxiosError) {
      this.$nextTick(() => {
        this.showSnackbar({
          text: error.response?.data || this.translations.somethingWentWrong,
          color: SnackbarColors.error
        });
      });     

      shared.setErrorState(this);
    },
    async updateInput() {
      shared.removeErrorState(this);
      this.updateRequestBody([this.formId, {[this.inputData.maxAttribute]: this.inputValue}]);
      
      const updateBody = {
        inputId: this.inputData.maxAttribute,
        newValue: this.inputValue,
        pageType: this.pageType,
        pageName: this.pageName,
        isRegistration: this.$route.path === "/registration" ? true : false,
        url: this.updateUrl,
        callbacks: {
          400: this.badRequest,
          501: this.handle501
        }
      } as UpdateInputRequest;

      await this.updateInputData([updateBody, this.formId]);
    },
    enterKeyPressed() {
      this.$emit("enterKeyPressed");
    }
  }
});
</script>
