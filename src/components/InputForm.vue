<template>
  <v-card-text>
    <v-progress-linear
      v-if="isLoading"
      color="blue darken-3"
      indeterminate
    />
    <v-container id="input-container">
      <v-row>
        <v-col 
          :cols="12"
          :lg="!input.isMultiPartInput ? 12 : 6"
          v-for="input in transformedInputs"
          :key="input.maxAttribute"
        >
          <form autocomplete="off" @submit.prevent>
            <v-container v-if="input.inputNotesAbove && Object.keys(input.inputNotesAbove).length > 0" class="input-note-container">
              <div>
                <input-note
                  v-for="(markdown, index) in input.inputNotesAbove"
                  :key="index"
                  :multiple-markdown="markdown"
                />
              </div>
            </v-container>
            <text-input-with-button
              v-if="input.inputType === 'TextInputWithButtonModel'"
              :input-data="input"
              :is-editing="isEditing"
              :lookup-table-url="lookupTableDataUrl"
              :page-type="pageType"
              :update-url="updateUrl"
              :form-id="formId"
              @enterKeyPressed="enterKeyPressed"
              @input-error="updateInputError"
              @textInputLookup="lookupInputData"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <text-area-input
              v-if="input.inputType === 'TextAreaInputModel'"
              :input-data="input"
              :is-editing="isEditing"
              :update-url="updateUrl"
              :page-type="pageType"
              :form-id="formId"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <checkbox-input
              v-if="input.inputType === 'CheckBoxInputModel'"
              :input-data="input"
              :is-editing="isEditing"
              :page-type="pageType"
              :form-id="formId"
              :update-url="updateUrl"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <text-input
              v-if="input.inputType === 'TextInputModel'"
              :input-data="input"
              :is-editing="isEditing"
              :page-type="pageType"
              :update-url="updateUrl"
              :form-id="formId"
              @enterKeyPressed="enterKeyPressed"
              @input-error="updateInputError"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <datetime-input
              v-if="input.inputType === 'DateTimeInputModel'"
              :input-data="input"
              :is-editing="isEditing"
              :update-url="updateUrl"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
             <date-input
              v-if="input.inputType === 'DateInputModel'"
              :input-data="input"
              :is-editing="isEditing"
              :update-url="updateUrl"
              :page-type="pageType"
              :form-id="formId"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <dropdown-input
              v-if="input.inputType === 'DropDownInputModel'"
              :input-data="input"
              :dropdown-url="dropdownDataUrl"
              :page-type="pageType"
              :is-editing="isEditing"
              :update-url="updateUrl"
              :log-types="worklogTypes"
              :form-id="formId"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <file-input
              v-if="input.inputType === 'FileInputModel'"
              :input-data="input"
              :is-editing="isEditing"
              :update-url="updateUrl"
              :page-type="pageType"
              :form-id="formId"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <number-input
              v-if="input.inputType === 'NumberInputModel'"
              :input-data="input"
              :is-editing="isEditing"
              :update-url="updateUrl"
              :page-type="pageType"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <rich-text
              v-if="input.inputType === 'RichTextInputModel'"
              :input-data="input"
              :is-editing="isEditing"
              :update-url="updateUrl"
              :page-type="pageType"
              :form-id="formId"
              :is-highlighted="input.isHighlighted"
              :translations="translations"
            />
            <v-container v-if="input.inputNotesBelow && Object.keys(input.inputNotesBelow).length > 0" class="input-note-container">
              <div>
                <input-note
                  v-for="(markdown, index) in input.inputNotesBelow"
                  :key="index"
                  :multiple-markdown="markdown"
                />
              </div>
            </v-container>
          </form>
        </v-col>
      </v-row>
    </v-container>
    <data-table
      @option-selected="tableRowSelected"
      :form-id="dataTableProps.formId"
      :max-attribute="dataTableProps.maxAttribute"
      :is-inquiry-page-lookup="false"
      :page-type="pageType"
      :page-name="pageName"
      :translations="translations"
    />
  </v-card-text>
</template>

<script lang="ts">
import Vue from "vue";
import DataTable from "./DataTable.vue";
import TextInputComponent from "./TextInput.vue";
import TextAreaInput from "./TextAreaInput.vue";
import TextInputWithButton from "./TextInputWithButton.vue";
import CheckboxInput from "./CheckboxInput.vue";
import DateInput from "./DateInput.vue";
import DateTimeInput from "./DateTimeInput.vue";
import DropdownInput from "./DropdownInput.vue";
import FileInput from "./FileInput.vue";
import NumberInput from "./NumberInput.vue";
import RichTextInput from "./RichTextInput.vue";
import InputNote from "./InputNote.vue";
import { mapGetters, mapActions, mapMutations } from "vuex";
import {
  SnackbarBody,
  SnackbarColors,
  LookupTable,
  UpdateInputRequest,
  GetLookupTableInput
} from "./../../models/MiscTypes";
import { getPageName } from "./../../services/SharedFunctions";
import { cloneDeep } from "lodash";
import { InputBase } from "../../models/InputBase";
import Wraxios from "./../../services/Wraxios";
import axios, { AxiosResponse, AxiosError } from "axios";
import { isMissingFormId } from "./../../services/ComponentHelpers";
import { Translations } from "./../../translations/Translations";

const wraxios = new Wraxios();

export default Vue.extend({
  components: {
    "data-table": DataTable,
    "input-note": InputNote,
    "text-input": TextInputComponent,
    "text-area-input": TextAreaInput,
    "text-input-with-button": TextInputWithButton,
    "file-input": FileInput,
    "checkbox-input": CheckboxInput,
    "date-input": DateInput,
    "datetime-input": DateTimeInput,
    "dropdown-input": DropdownInput,
    "number-input": NumberInput,
    "rich-text": RichTextInput
  },
  props: {
    pageInputs: {
      type: Array as () => InputBase[] || null,
      required: true
    },
    multiPartRelationships: {
      type: Object,
      required: true
    },
    dropdownDataUrl: {
      type: String,
      required: true
    },
    lookupTableDataUrl: {
      type: String,
      required: true
    },
    dependenciesUrl: {
      type: String,
      required: true
    },
    updateUrl: {
      type: String,
      required: false
    },
    pageType: {
      type: String,
      required: false
    },
    // Since new worklogs have type edit page, we have to differentiate them somehow
    // from the edit page. This prop allows us to do that.
    isNewWorklog: Boolean,
    formId: {
      type: String,
      required: true
    },
    disabled: Boolean,
    // The isEditing prop is passed to all inputs on the input form and is
    // used by a watcher function on each input to toggle the readonly attribute.
    // It's main purpose is to allow the inputs on the profile form to know
    // when they need to be available for editing. The watcher is not set to run immediate,
    // so the input components have logic to determine if they are on the profile page 
    // which is used to initially set the readOnly value.
    // The InputForm gets reloaded in the case that the cancel/submit buttons are clicked, so the
    // watchers on isEditting do not currently have logic to set the inputs back to readOnly
    isEditing: Boolean,
    worklogTypes: {
      type: Array as () => {[key: string]: string}[],
      required: false
    },
    translations: {
      type: Object as () => Translations,
      required: true
    }
  },
  data() {
    return {
      isLoading: false as boolean,
      pageName: "" as string,
      title: "" as string,
      transformedInputs: [] as Array<InputBase>,
      dataTableProps: {
        formId: "" as string,
        maxAttribute: "" as string
      }
    };
  },
  computed: {
    ...mapGetters({
      langauge: "get_language",
      userData: "get_userData",
      lookupTableData: "get_lookupTableData",
      getMissingRequiredAttributes: "get_missingRequiredAttributes",
      getDependenciesObject: "get_dependenciesObject"
    })
  },
  beforeMount() {
    this.setLookupTableData({
      ...this.lookupTableData,
      show: false,
      isLoading: false
    });

    if (isMissingFormId(this.formId)) {
      this.$router.push("/LandingPage");
      
      this.showSnackbar({
        text: this.translations.problemLoadingTheForm,
        color: SnackbarColors.error
      } as SnackbarBody);

      return;
    }

    this.transformPageInputs();

    // Make sure any inputs with default values are automatically
    // added to the newRequestBody in Vuex. This is done to make
    // sure any select elements or any other lookup elements that
    // have default values that aren't changed by the user still
    // make it into the request body.
    // This logic runs for edit/details pages as well even though their data should not get modified
    // and does not get submitted. This is to avoid a bug where not having data in the store, but having
    // a modifiable input form sharing the page with an edit/details form caused errors in the watchers of
    // the inputs on the edit/details form.
    this.pageInputs.filter(x => x.defaultValue !== "").forEach(input => {
      this.updateRequestBody([this.formId, {[input.maxAttribute]: input.defaultValue}]);
    });
  },
  async created() {
    this.pageName = getPageName(this.$route);
    await this.getDependencies();
  },
  destroyed() {
    this.clearNewRequestBodyFormId(this.formId);
    this.setDefaultRequestBody();
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar",
      updateInputData: "updateInputData",
      textInputLookup: "textInputLookup"
    }),
    ...mapMutations({
      setLookupTableData: "set_lookupTableData",
      updateRequestBody: "update_newRequestBody",
      setDependenciesObject: "set_dependenciesObject",
      setDefaultRequestBody: "set_defaultRequestBody",
      clearNewRequestBodyFormId: "clear_newRequestBody_formId"
    }),
    transformPageInputs() {
      const values = Object.values(this.multiPartRelationships);
      const clonedInputs = cloneDeep(this.pageInputs);

      if(values.length === 0) {
        this.transformedInputs = clonedInputs as Array<InputBase>;
        return;
      }

      this.transformedInputs = [] as Array<InputBase>;
      clonedInputs.forEach(input => {
        if (this.multiPartRelationships[(input as InputBase).maxAttribute]) {
          (input as InputBase)["isMultiPartInput"] = true;
          this.transformedInputs.push((input as InputBase));
          // If we find a multiPartInput primary input, we need to make sure that
          // the secondary input is the next input in our array
          const secondaryInput = this.multiPartRelationships[(input as InputBase).maxAttribute] as string;
          clonedInputs.forEach(input2 => {
            if ((input2 as InputBase).maxAttribute == secondaryInput) {
              (input2 as InputBase)["isMultiPartInput"] = true;
              this.transformedInputs.push((input2 as InputBase));
            }
          });
        // If the input is not a multiPartInput, then we can just add it to our array
        } else if (!values.includes((input as InputBase).maxAttribute)) {
          (input as InputBase)["isMultiPartInput"] = false;
          this.transformedInputs.push((input as InputBase));
        }
      });
      // TODO: Should we have some error checking to make sure that our transformedInputs array length
      //       matches the original pageInputs array length? If so, what should we do on failure?
    },
    updateMissingRequired() {
      if (this.getMissingRequiredAttributes > 0) {
        const missingAttributes = this.getMissingRequiredAttributes as string[];
        missingAttributes.forEach(x => {
          const el = document.getElementById(x);

          if (el != null) {
            el.style.borderColor = "red";
          }
        });

        this.showSnackbar({
          text: this.translations.enterTheMissingInformation,
          color: SnackbarColors.warn
        } as SnackbarBody);
      }
    },
    badRequest(error: AxiosError) {
      this.showSnackbar({
        text: error.response?.data || this.translations.somethingWentWrong,
        color: SnackbarColors.error
      });
    },
    tableRowSelected(rowNumber: string) {
      this.setLookupTableData({
        ...this.lookupTableData,
        show: false
      } as LookupTable);
      // Because all the component input IDs have `-input` appended to
      // them we need to get the substring of the ID that leaves off the
      // `-input` so we're left with just the maxAttriubte, e.g. location-input
      // turns into location.
      const elementId = this.lookupTableData.inputId.substring(0, this.lookupTableData.inputId.indexOf("-input"));
      const inputId = `${this.lookupTableData.inputId}-${this.dataTableProps.formId}`;
      const input = document.getElementById(inputId) as HTMLInputElement;

      if (input) {
        input.value = rowNumber;
      }

      this.updateRequestBody([this.formId, {[elementId]: input.value}]);
      const updateBody: UpdateInputRequest = {
        inputId: elementId,
        newValue: input.value,
        pageName: getPageName(this.$route),
        pageType: this.pageType,
        url: this.updateUrl,
        isRegistration: this.$route.path === "/registration" ? true : false,
        callbacks: {
          400: this.badRequest
        }
      };

      this.updateInputData([updateBody, this.formId]);
    },
    enterKeyPressed() {
      this.$emit("enterKeyPressed");
    },
    // eslint-disable-next-line
    updateInputError(e: any) {
      this.$emit("input-error", e);
    },
    getDependenciesOk(response: AxiosResponse) {
      this.setDependenciesObject(response.data);
    },
    async getDependencies() {
      if (window.location.href.includes("editPage")) {
        // We aren't concerned with dependencies on edit pages.
        return;
      }

      const callbacks = {
        200: this.getDependenciesOk
      };

      await wraxios.get(
        axios,
        `${this.dependenciesUrl}?pageName=${this.pageName}&pageType=${this.pageType}`,
        callbacks
      );
    },
    async lookupInputData(e: GetLookupTableInput) {
      this.dataTableProps.formId = e.formId as string;
      this.dataTableProps.maxAttribute = e.maxAttribute?.substring(0, e.maxAttribute.indexOf("-input")) as string;
      
      await this.textInputLookup(e);
    }
  }
});
</script>

<style lang="scss">
@import "@/scss/components/_input-border";
$warn-color: orange;

@mixin input-warn-border() {
  &:after {
    @include input-border-base();

    // overriding onfocus effects
    transform: scaleX(1) !important;
    border: 1px solid $warn-color !important;
  }
}

.input-highlight {

  // syncfusion rich text component
  &.rte-container {
    &:first-child {
      p {
        color: $warn-color;
      }

      @include input-warn-border();
    }
  }

  // vuetify components
  .v-input__slot {
    input, textarea, .v-select__selection {
      color: $warn-color;
    }

    @include input-warn-border();
  }
}
</style>

<style lang="scss" scoped>
.input-note-container {
  padding: 0;
}
</style>
