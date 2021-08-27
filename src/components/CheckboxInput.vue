<template>
  <v-container
    class="pa-2 text-xs-center mb-n5 checkbox-input"
    align-center
    justify-center
  >
    <v-row class="my-n3">
      <v-col cols="12">
        <div :id="`${inputData.maxAttribute}-border-${formId}`">
          <v-checkbox
            :id="`${inputData.maxAttribute}-input-${formId}`"
            class="custom-vue-input text-caption shrink my-n5"
            v-model="isChecked"
            :readonly="isReadonly"
            @change="updateInput"
            :error="isErrorState"
            :disabled="isDisabled"
            hide-details
          />
          <span id="checkbox-label-text">
            <label
              :for="inputData.maxAttribute"
              :class="['input-label', {'orange--text': isHighlighted}]"
              :id="labelId"
              >
                {{ labelText }}
              </label>
          </span>         
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
import { CheckBoxInput } from "./../../models/Classes";
import {
  isComponentError,
  isProfilePagePath,
  getPageName,
  removeErrorState,
  allDependenciesHaveValues
} from "./../../services/SharedFunctions";
import { UpdateInputRequest } from "./../../models/MiscTypes";
import { Translations } from "./../../translations/Translations";
import { storeHasValueForInput } from "./../../services/ComponentHelpers";

export default Vue.extend({
  props: {
    inputData: {
      type: Object as () => CheckBoxInput,
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
      isChecked: false as boolean,
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
        if (!this.inputData.rules.readOnly) {
          this.isReadonly = false;
        }

        if (!!this.inputData.rules.required) {
          this.labelText = `${this.inputData.label} (${this.translations.required})`;
        }
      }
    },
    getRequestBody: {
      deep: true,
      handler () {
        const maxAttribute = this.inputData.maxAttribute;

        // Set the default value
        if (storeHasValueForInput(this.formId, maxAttribute)) {
          removeErrorState(this);
          // The value is converted to a string in vuex so it's necessary to make sure
          // we're setting isChecked as a boolean and not the string True or False.
          this.isChecked = String(this.getRequestBody[this.formId][maxAttribute]).toUpperCase() === "TRUE";
        }

        this.isDisabled = !allDependenciesHaveValues(
          this.inputData.dependencies  as string[], this.formId);
      }
    },
    getNewRequestBodyErrors: {
      deep: true,
      handler() {
        this.isErrorState = isComponentError(
          this.inputData.maxAttribute, this.formId);
      }
    }
  },
  computed: {
    ...mapGetters({
      getRequestBody: "get_newRequestBody"
    })
  },
  beforeMount() {
    this.isReadonly = this.inputData.rules.readOnly as boolean;
    this.labelId = `${this.formId}${this.inputData.maxAttribute}`;

    if (!this.isReadonly) {
      // If the URL path indicates we're on the profile page, the inputs
      // should initially be set to readonly.
      this.isReadonly = isProfilePagePath(this.$route.path);     
    }

    this.labelText = 
      (!!this.isEditing && this.inputData.rules.required)
        ? `${this.inputData.label} (${this.translations.required})`
        : this.inputData.label;


    const maxAttribute = this.inputData.maxAttribute;

    if (storeHasValueForInput(this.formId, maxAttribute)) {
      // The value is converted to a string in vuex so it's necessary to make sure
      // we're setting isChecked as a boolean and not the string True or False.
      this.isChecked = String(this.getRequestBody[this.formId][maxAttribute]).toUpperCase() === "TRUE";
    }
  },
  methods: {
    ...mapActions({
      updateInputData: "updateInputData"
    }),
    ...mapMutations({
      updateRequestBody: "update_newRequestBody"
    }),
    async updateInput() {
      // If the input is in an error state and the value gets
      // changed, it's likely the change was in response to the
      // error. If so, we should remove the error state from
      // the input to make the UI more intuitive for the user.
      removeErrorState(this);
      this.updateRequestBody(
        [this.formId], { [this.inputData.maxAttribute]: this.isChecked }
      );

      const updateBody = {
        inputId: this.inputData.maxAttribute,
        newValue: this.isChecked,
        pageType: this.pageType,
        pageName: getPageName(this.$route),
        isRegistration: this.$route.path === "/registration" ? true : false,
        url: this.updateUrl,
        callbacks: {}
      } as UpdateInputRequest;

      await this.updateInputData([updateBody, this.formId]);
    }
  }
});
</script>

<style scoped>
#checkbox-label-text {
  margin-left: 20px;
}

.checkbox-input {
  margin-top: 20px;
  margin-bottom: 0px !important;
}
</style>
