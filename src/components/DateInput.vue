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

    <v-row class="mt-n8 mb-n7">
      <v-col cols="12">
        <div :id="`${inputData.maxAttribute}-border-${formId}`">
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
            :disabled="!isEditing"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="formattedDate"
                :class="{'input-highlight': isHighlighted}"
                append-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                :clearable="isEditing"
                @blur="date = parseDate(formattedDate)"
                @click:clear="clearDate"
              />
            </template>
            
            <v-date-picker
              v-model="date"
              no-title
              @input="menu = false"           
              :max="inputData.maxDate"
              :min="inputData.minDate"
              @change="updateDate"
              :readonly="isReadonly"
              :locale="language"
            />
          </v-menu>
        </div>        
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
import { DateTimeBase } from "./../../models/Classes";
import * as shared from "./../../services/SharedFunctions";
import { SnackbarBody, SnackbarColors, UpdateInputRequest } from "./../../models/MiscTypes";
import { AxiosError } from "axios";
import { Translations } from "./../../translations/Translations";
import { storeHasValueForInput } from "./../../services/ComponentHelpers";
import "../date.extensions";

export default Vue.extend({
  props: {
    inputData: {
      type: Object as () => DateTimeBase,
      required: true
    },
    isEditing: Boolean,
    pageType: {
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
      isReadonly: false as boolean,
      isErrorState: false as boolean,
      labelText: "" as string,
      isDisabled: false as boolean,
      date: new Date().toISOString().substring(0, 10),
      maxDate: new Date(),
      minDate: new Date(),
      labelId: "" as string,
      menu: false as boolean,
      formattedDate: new Date().toISOString().substring(0, 10) as string
    };
  },
  watch: {    
    isEditing() {
      if (this.isEditing === true) {
        if (!this.inputData.rules.readOnly as boolean) {
          this.isReadonly = false;

          if (!!this.inputData.rules.required) {
            this.labelText = `${this.inputData.label} (${this.translations.required})`;
          }
        }
      }
    },
    getRequestBody: {
      deep: true,
      handler() {
        if (this.getRequestBody[this.formId]) {
          const maxAttribute = this.inputData.maxAttribute;
          const date = this.getRequestBody[this.formId][maxAttribute];
          const formattedRequestBodyDate = this.formatDate(date);

          if (date && formattedRequestBodyDate !== this.formattedDate) {
              shared.removeErrorState(this);
              this.date = new Date(date).toISOString();
          } else if (!date) {
            shared.removeErrorState(this);
            this.date = "";
          }
        }

        this.isDisabled = !shared.allDependenciesHaveValues(this.inputData.dependencies as string[], this.formId);
      }
    },
    getNewRequestBodyErrors: {
      deep: true,
      handler() {
        this.isErrorState = shared.isComponentError(this.inputData.maxAttribute, this.formId);
      }
    },
    date() {
      this.formattedDate = this.formatDate(this.date) as string;
    }
  },
  computed: {
    ...mapGetters({
      getRequestBody: "get_newRequestBody",
      language: "get_language"
    })
  },
  beforeMount() {
    this.isReadonly = this.inputData.rules.readOnly as boolean;

    if (!this.isReadonly) {
      // If the URL path indicates we're on the profile page, the inputs
      // should be set to readonly.
      this.isReadonly = shared.isProfilePagePath(this.$route.path);     
    }

    this.labelId = `${this.formId}${this.inputData.maxAttribute}`;
    this.isDisabled = !shared.allDependenciesHaveValues(this.inputData.dependencies as string[], this.formId);

    this.labelText = 
      (!!this.isEditing && this.inputData.rules.required)
        ? `${this.inputData.label} (${this.translations.required})`
        : this.inputData.label;

    const maxAttribute = this.inputData.maxAttribute;

    // Set the default date
    if (storeHasValueForInput(this.formId, maxAttribute)) {
      const date = this.getRequestBody[this.formId][maxAttribute];

      if (date) {
        this.date = new Date(date).toISOString();
      }
    } else {
      this.date = "";
    }
      
    const maxDate: Date = this.inputData.maxDate;
    const minDate: Date = this.inputData.minDate;

    // If no max date is supplied, default to 1 year in the future.  
    this.maxDate = maxDate ? maxDate : new Date().addDays(365);

    // If no min date is supplied, default to today's date
    this.minDate = minDate ? minDate : new Date();

    if (this.inputData.defaultValue != "") {
      this.updateRequestBody(
        [this.formId, {[this.inputData.maxAttribute ]: this.inputData.defaultValue }]
      );
    }
  },
  methods: {
    ...mapActions({
      updateInputData: "updateInputData",
      setSnackBar: "do_showSnackbar"
    }),
    ...mapMutations({
      updateRequestBody: "update_newRequestBody"
    }),
    formatDate(date: string) {
      if (!date) {
        return "";       
      }

      // Force date into ISO format
      date = new Date(date).toISOString();

      // Dates will come in ISO format (YYYY-MM-DDTHH:MM:SS.mmmZ)
      // so we truncate it down to YYYY-MM-DD
      if (date.includes("T")) {
        date = date.substring(0, date.indexOf("T"));
      }

      const [year, month, day] = date.split("-");

      return `${month}/${day}/${year}`;
    },
    parseDate(date: string) {
      if (!date) {
        return "";
      }

      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    updateFailure(error: AxiosError) {
      this.$nextTick(() => {
        this.setSnackBar({
          text: error.response?.data || this.translations.problemValidatingDate,
          color: SnackbarColors.error
        } as SnackbarBody);
      });

      shared.setErrorState(this);
    },
    clearDate() {
      this.date = "";
      this.updateDate();
    },
    async updateDate() {
      this.$nextTick(async () => {
        shared.removeErrorState(this);

        this.updateRequestBody(
          [this.formId, {[this.inputData.maxAttribute ]: this.formattedDate }]
        );

        const updateBody = {
          inputId: this.inputData.maxAttribute,
          newValue: this.formattedDate,
          pageType: this.pageType,
          pageName: shared.getPageName(this.$route),
          isRegistration: this.$route.path === "/registration" ? true : false,
          url: this.updateUrl,
          callbacks: {
            400: this.updateFailure
          }
        } as UpdateInputRequest;

        await this.updateInputData([updateBody, this.formId]);
      });     
    }
  }
});
</script>