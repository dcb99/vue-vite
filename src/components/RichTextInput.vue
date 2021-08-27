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

    <v-row>
      <v-col cols="12">
        <div
          :id="`${inputData.maxAttribute}-border-${formId}`"
          class="rte-container"
          @focusin="rteActive=true"
          @focusout="rteActive=false"
          :class="{'rte-container-active': rteActive, 'input-highlight': isHighlighted}"
          tabindex="0"
        >
          <ejs-richtexteditor 
            :value="inputValue"
            :readonly="isReadonly"
            @change="updateInput"
            v-model="inputValue"
            :disabled="isDisabled"
            class="rich-text-editor"
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
import {
  RichTextEditorPlugin,
  Image,
  HtmlEditor
} from "@syncfusion/ej2-vue-richtexteditor";
import { InputBase } from "./../../models/InputBase";
import * as shared from "./../../services/SharedFunctions";
import { 
  UpdateInputRequest,
  SnackbarBody,
  SnackbarColors
} from "../../models/MiscTypes";
import { AxiosError } from "axios";
import { Translations } from "./../../translations/Translations";
import { storeHasValueForInput } from "./../../services/ComponentHelpers";

Vue.use(RichTextEditorPlugin);

export default Vue.extend({
  props: {
    inputData: {
      type: Object as () => InputBase,
      required: true
    },
    pageType: {
      type: String, 
      required: true
    },
    updateUrl: {
      type: String,
      required: false
    },
    formId: {
      type: String,
      required: true
    },
    isEditing: Boolean,
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
      labelText: "" as string,
      isReadonly: false as boolean,
      isErrorState: false as boolean,
      inputValue: "" as string,
      isDisabled: false as boolean,
      labelId: "" as string,
      rteActive: false
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

        // In the case that the requestBody has an undefined value for this key,
        // we need to set that key to have a value of an empty string so that
        // the input on the page does not have "undefined" as the text
        if (this.getRequestBody[this.formId]) {
           if (this.getRequestBody[this.formId][maxAttribute] !== this.inputValue) {
            shared.removeErrorState(this);
          
            if (this.getRequestBody[this.formId][maxAttribute] === undefined)
            {
              this.updateRequestBody(
                [this.formId, { [this.inputData.maxAttribute]: ""}]
              );
              this.inputValue = "";
            } else {
              this.inputValue = this.getRequestBody[this.formId][maxAttribute];
            }

            this.isDisabled = !shared.allDependenciesHaveValues(this.inputData.dependencies as string[], this.formId);
          }
        }       
      }      
    },
    getNewRequestBodyErrors: {
      deep: true,
      handler() {
        this.isErrorState = shared.isComponentError(this.inputData.maxAttribute, this.formId);
      }
    }
  },
  computed: {
    ...mapGetters({
      getRequestBody: "get_newRequestBody",
      getNewRequestBodyErrors: "get_newRequestBodyErrors",
    })
  },
  beforeMount() {
    this.labelId = `${this.formId}${this.inputData.maxAttribute}`;
    this.labelText =
      (!!this.isEditing && this.inputData.rules.required)
        ? `${this.inputData.label} (${this.translations.required})`
        : this.inputData.label;
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

    this.isDisabled = !shared.allDependenciesHaveValues(this.inputData.dependencies as string[], this.formId);
  },
  provide: {
    richtexteditor: [HtmlEditor, Image]
  },
  methods: {
    ...mapActions({
      updateInputData: "updateInputData",
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      updateRequestBody: "update_newRequestBody"
    }),
    badRequest(error: AxiosError) {
      this.showSnackbar({
        text: error
          ? error.response?.data
          : this.translations.somethingWentWrong,
        color: SnackbarColors.error
      } as SnackbarBody);

      shared.setErrorState(this);
    },
    async updateInput() {
      shared.removeErrorState(this);
      this.updateRequestBody(
        [this.formId, { [this.inputData.maxAttribute]: this.inputValue}]
      );

      const updateBody = {
        inputId: this.inputData.maxAttribute,
        newValue: this.inputValue as string,
        pageType: this.pageType,
        pageName: shared.getPageName(this.$route),
        isRegistration: false,
        url: this.updateUrl,
        callbacks: {
          400: this.badRequest
        }
      } as UpdateInputRequest;

      await this.updateInputData([updateBody, this.formId]);
    }
  }
});
</script>

<style lang="scss">
.rte-container {
  .rich-text-editor {
    .e-rte-content, .e-source-content {
      .e-content { 
        padding: 0;
        font-size: 16px;
      }

      border: 0;
    }
  }
}
</style>

<style lang="scss" scoped>
@import "@/scss/components/_input-border";

.rte-container {
  width: 100%;
  text-align: left;

  &:first-child {
    position: relative;
    cursor: text;

    &:before {
      @include input-border-base();
      border-bottom: 1px solid rgba(0, 0, 0, 0.42);
    }

    &:after {
      @include input-border-base();
      border: 1px solid rgba(25, 118, 210, 1);
      transform: scaleX(0);
    }

    &:hover {
      &:before {
        border-color: rgba(0, 0, 0, 0.87);
      }
    }
  }
}

.rte-container-active {
  &:first-child, &:first-child:hover {
    &:after {
      transform: scaleX(1);
    }
  }
}
</style>