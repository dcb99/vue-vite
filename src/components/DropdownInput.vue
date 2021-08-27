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
        :class="['dropdown-label', {'orange--text': isHighlighted}]"
      >
        {{ labelText }}
      </label>
    </v-row>

    <v-row class="custom-text-input my-n7">
      <v-col cols="12">
        <div :id="`${inputData.maxAttribute}-border-${formId}`">
          <v-select
            :id="`${inputData.maxAttribute}-input-${formId}`"
            :class="['custom-vue-input', {'input-highlight': isHighlighted}]"
            item-text="display"
            v-model="selectedValue"
            :items="dropdownItems.length > 0 ? dropdownItems : logTypes"
            :readonly="isReadonly"
            @change="updateInput"
            :error="isErrorState"
            :disabled="isDisabled"
            :loading="isLoading"
            :aria-label="inputData.maxAttribute"
            @click="getDropdownData()"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Wraxios from "./../../services/Wraxios";
import * as shared from "./../../services/SharedFunctions";
import { DropdownInput } from "../../models/Classes";
import { 
  SnackbarBody,
  SnackbarColors,
  UpdateInputRequest, 
  PageTypes
} from "../../models/MiscTypes";
import { mapActions, mapMutations, mapGetters } from "vuex";
import axios, { AxiosResponse, AxiosError } from "axios";
import { Translations } from "./../../translations/Translations";
import { storeHasValueForInput } from "./../../services/ComponentHelpers";

const wraxios = new Wraxios();

export default Vue.extend({
  props: {
    inputData: {
      type: Object as () => DropdownInput,
      required: true
    },
    dropdownUrl: {
      type: String,
      required: true
    },
    pageType: {
      type: String,
      required: true
    },
    isEditing: Boolean,
    updateUrl: {
      type: String,
      required: true
    },
    logTypes: {
      type: Array as () => {[key: string]: string}[],
      required: false
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
      type: Object as () => Translations 
    }
  },
  data() {
    return {
      dropdownItems: [] as {[key: string]: string}[],
      isLoading: false as boolean,
      selectedValue: "" as string,
      isDisabled: false as boolean,
      isReadonly: false as boolean,
      isErrorState: false as boolean,
      labelText: "" as string,
      pageName: "" as string,
      labelId: "" as string
    };
  },
  computed: {
    ...mapGetters({
      getRequestBody: "get_newRequestBody",
      getNewRequestBodyErrors: "get_newRequestBodyErrors"
    })
  },
  watch: {
    isEditing() {
      if (this.isEditing === true) {
        if(!this.inputData.rules.readOnly as boolean) {
          this.isReadonly = false;
        }

        if (!!this.inputData.rules.required) {
          this.labelText = `${this.inputData.label} (${this.translations.required})`;
        }
      }      
    },
    getRequestBody: {
      deep: true,
      async handler() {
        const maxAttribute = this.inputData.maxAttribute;

        // In the event that the request body does not (or no longer) contains the value in the component, we need to remove it from the UI
        if (this.getRequestBody[this.formId]
          && !this.getRequestBody[this.formId][maxAttribute])
        {
          shared.removeErrorState(this);
          this.selectedValue = "";
          this.dropdownItems = [];
        }

        if ( storeHasValueForInput(this.formId, maxAttribute)
          && this.getRequestBody[this.formId][maxAttribute] !== this.selectedValue) {
            shared.removeErrorState(this);
            await this.getDropdownData();
            this.selectedValue = this.pageType === PageTypes.EditPage
              ? this.getRequestBody[this.formId][maxAttribute].toUpperCase()
              : this.getRequestBody[this.formId][maxAttribute];
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
  async beforeMount() {
    this.labelId = `${this.formId}${this.inputData.maxAttribute}`;
    this.isDisabled = !shared.allDependenciesHaveValues(this.inputData.dependencies as string[], this.formId);
    this.isReadonly = this.inputData.rules.readOnly as boolean;

    if (!this.isReadonly) {
      // If the URL path indicates we're on the profile page, the inputs
      // should be set to readonly.
      this.isReadonly = shared.isProfilePagePath(this.$route.path);     
    }

    this.labelText = 
      (!!this.isEditing && this.inputData.rules.required)
        ? `${this.inputData.label} (${this.translations.required})`
        : this.inputData.label;

    this.pageName = shared.getPageName(this.$route);
    const maxAttribute = this.inputData.maxAttribute;

    // Set the default value
    if (storeHasValueForInput(this.formId, maxAttribute)) {
        await this.getDropdownData();
        this.selectedValue = this.pageType === PageTypes.EditPage
          ? this.getRequestBody[this.formId][maxAttribute].toUpperCase()
          : this.getRequestBody[this.formId][maxAttribute];
    }
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar",
      updateInputData: "updateInputData"
    }),
    ...mapMutations({
      updateRequestBody: "update_newRequestBody"
    }),
    getDropdownDataSuccess(response: AxiosResponse) {
      this.dropdownItems = response.data;
      this.isLoading = false;
    },
    // eslint-disable-next-line
    getDropdownDataFailure(error: AxiosError) {
      this.$nextTick(() => {
      const snackbarBody: SnackbarBody = {
        text: `${this.translations.problemGettingDataFor} ${this.inputData.maxAttribute}.`,
        color: SnackbarColors.error
      };

        this.showSnackbar(snackbarBody);
        this.isLoading = false;
      });     
    },
    async getDropdownData(): Promise<void> {
      if (this.pageType === PageTypes.EditPage) {
        // EditPages shouldn't be using any kind of lookup inputs so we
        // shouldn't be attempting to get data for the v-select. The new
        // worklogs input form is also on an editPage, and for now it's
        // safe to assume that there will be no dropdown inputs on it. If the
        // log types are in a dropdown, that data will be supplied as a
        // prop to the component and there's logic in place to recognize 
        // that and populate the dropdown items in the v-select.
        return;
      }

      // Whenever we get the dropdown data, we clear the current list of items so that the user does not see
      // the old (potentially no longer relevent) list of data.
      this.dropdownItems = [];
      this.isLoading = true;

      const callbacks = {
        200: this.getDropdownDataSuccess,
        400: this.getDropdownDataFailure,
        500: this.getDropdownDataFailure
      };    

      const url = `${this.dropdownUrl}?inputId=${this.inputData.maxAttribute}&pageName=${this.pageName}&pageType=${this.pageType}`;

      await wraxios.get(
        axios,
        url,
        callbacks as {[key: number]: Function}
      );
    },
    handle501(error: AxiosError) {
      this.$nextTick(() => this.showSnackbar({
        text: `${this.inputData.maxAttribute} ${error.response?.data}`,
        color: SnackbarColors.error
      } as SnackbarBody));

      shared.setErrorState(this);
    },
    badRequest(error: AxiosError) {
      this.showSnackbar({
        text: error.response?.data || this.translations.somethingWentWrong
      });

      shared.setErrorState(this);
    },
    async updateInput() {
      shared.removeErrorState(this);
      this.updateRequestBody(
        [this.formId, { [this.inputData.maxAttribute]: this.selectedValue}]
      );

      const updateBody = {
        inputId: this.inputData.maxAttribute,
        newValue: this.selectedValue,
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
    }
  }
});
</script>
