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
            :readonly="isReadonly"
            @change="updateInput"
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
import { TextInputBase } from "../../models/Classes";
import * as shared from "./../../services/SharedFunctions";
import { 
  UpdateInputRequest,
  SnackbarBody,
  SnackbarColors
} from "../../models/MiscTypes";
import { AxiosError } from "axios";
import { Translations } from "./../../translations/Translations";
import { storeHasValueForInput } from "./../../services/ComponentHelpers";

export default Vue.extend({
  props: {
    inputData: {
      type: Object as () => TextInputBase,
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
      inputValue: "" as string,
      isReadonly: false as boolean,
      isErrorState: false as boolean,
      labelText: "" as string,
      isDisabled: false as boolean,
      labelId: "" as string
    };
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
      handler() {
        const maxAttribute = this.inputData.maxAttribute;

        if ( storeHasValueForInput(this.formId, maxAttribute)
          && this.getRequestBody[this.formId][maxAttribute] !== this.inputValue) {
          shared.removeErrorState(this);
          this.inputValue = this.getRequestBody[this.formId][maxAttribute];
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
  beforeMount() {
    this.isDisabled = !shared.allDependenciesHaveValues(this.inputData.dependencies as string[], this.formId);
    this.labelId = `${this.formId}${this.inputData.maxAttribute}`;
    this.isReadonly = this.inputData.rules.readOnly as boolean;

    if (!this.isReadonly) {
      // If the URL path indicates we're on the profile page, the inputs
      // should be set to readonly.
      this.isReadonly = shared.isProfilePagePath(this.$route.path);     
    }

    const maxAttribute = this.inputData.maxAttribute;

    // Set the default value
    if (storeHasValueForInput(this.formId, maxAttribute)) {
      this.inputValue = this.getRequestBody[this.formId][maxAttribute];
    }

    this.labelText = 
      (!!this.isEditing && this.inputData.rules.required)
        ? `${this.inputData.label} (${this.translations.required})`
        : this.inputData.label;
  },
  computed: {
    ...mapGetters({
      getRequestBody: "get_newRequestBody",
      getNewRequestBodyErrors: "get_newRequestBodyErrors"
    })
  },
  methods: {
    ...mapActions({
      updateInputData: "updateInputData",
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      updateRequestBody: "update_newRequestBody"
    }),
    handle501(error: AxiosError) {
      this.$nextTick(() => this.showSnackbar({
        text: `${this.inputData.maxAttribute} - ${error.response?.data || this.translations.problemWithDataSent}`,
        color: SnackbarColors.error
      } as SnackbarBody));

      shared.setErrorState(this);
    },
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
      // If the input is in an error state and the value gets
      // changed, it's likely the change was in response to the
      // error. If so, we should remove the error state from
      // the input to make the UI more intuitive for the user.
      shared.removeErrorState(this);

      this.updateRequestBody(
        [this.formId, { [this.inputData.maxAttribute]: this.inputValue }]
      );

      const updateBody = {
        inputId: this.inputData.maxAttribute,
        newValue: this.inputValue,
        pageType: this.pageType,
        pageName: shared.getPageName(this.$route),
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

<style lang="scss" scoped>
.custom-text-input {
  margin-bottom: -3%;
}
</style>
