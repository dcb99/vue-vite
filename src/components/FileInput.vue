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

    <v-row class="my-n2">
      <v-col cols="12" class="file-input-container">
        <div :id="`${inputData.maxAttribute}-border`">
          <ejs-uploader
            :ref="`${formId}-upload`"
            :id="`file-uploader-${formId}`"
            :allowed-extensions="allowedFileTypes"
            :max-file-size="inputData.maxFileSize"
            :auto-upload="false"
            :locale="language"
            @selected="onFileSelect"
            :disabled="isDisabled"
            @removing="removeFile"
            :buttons="buttons"
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
  mapGetters,
  mapMutations
} from "vuex";
import { FileInput } from "./../../models/Classes";
import * as shared from "./../../services/SharedFunctions";
import {
  FileToUpload,
  SnackbarBody,
  SnackbarColors
} from "./../../models/MiscTypes";
import { 
  UploaderPlugin,
  FileInfo,
  UploaderComponent,
  SelectedEventArgs
} from "@syncfusion/ej2-vue-inputs";
import { cloneDeep } from "lodash";
import { L10n, isNullOrUndefined } from "@syncfusion/ej2-base";
import { Translations } from "./../../translations/Translations";

Vue.use(UploaderPlugin);
L10n.load({
  "es": {
    "uploader": {
      "dropFilesHint": "o soltar archivos aquí",
      "remove": "Eliminar"
    }
  }
});

export default Vue.extend({
  props: {
    inputData: {
      type: Object as () => FileInput,
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
      allowedFileTypes: "" as string,
      isDisabled: false as boolean,
      labelId: "" as string,
      buttons: {
        browse: this.translations.browse
      }
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
    getNewRequestBodyErrors: {
      deep: true,
      handler() {
        this.isErrorState = shared.isComponentError(this.inputData.maxAttribute, this.formId);
      }
    }
  },
  beforeMount() {
    // Unlike other inputs, this input component has a 
    // very minimal configuration and is only for uploading
    // attachments, so it will never be dependent on any
    // other input.
    this.labelId = `${this.formId}${this.inputData.maxAttribute}`;
    this.onload();

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
  },
  computed: {
    ...mapGetters({
      language: "get_language",
      getRequestBody: "get_newRequestBody"
    })
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      updateRequestBody: "update_newRequestBody"
    }),
    onload() {
      this.allowedFileTypes = 
        this.inputData.allowableFileTypes
          .toString()
          .split(",")
          .map(extension => `.${extension}`)
          .join(",");
    },

    // eslint-disable-next-line
    async onFileSelect(args: SelectedEventArgs) {
      const filesData = args.filesData;
      const uploader = this.$refs[`${this.formId}-upload`] as UploaderComponent;

      for (let i = 0; i < filesData.length; i++) { 
        const file = filesData[i] as FileInfo;

        if (!isNullOrUndefined(file)) { 
          const fileExtensionNotAllowed = shared.checkAllowedExtensions(
            file,
            this.allowedFileTypes,
            this.translations
          );
          const fileIsTooLarge = shared.checkFileSize(
            file,
            this.inputData.maxFileSize,
            this.translations
          );

          if (fileExtensionNotAllowed !== "") {
            this.showSnackbar({
              text: fileExtensionNotAllowed,
              color: SnackbarColors.error
            } as SnackbarBody);

            // Setting args.cancel to true will stop SyncFusion from adding files to the component
            args.cancel = true;
            return;
          } else if (fileIsTooLarge != "") {
            this.showSnackbar({
              text: fileIsTooLarge,
              color: SnackbarColors.error
            } as SnackbarBody);

            // Setting args.cancel to true will stop SyncFusion from adding files to the component
            args.cancel = true;
            return;
          } else if (file.size === 0) {
            this.showSnackbar({
              text: this.translations.filesCantBeEmpty,
              color: SnackbarColors.error
            } as SnackbarBody);

            // Setting args.cancel to true will stop SyncFusion from adding files to the component
            args.cancel = true;
            return;
          }
        }
      }
      
      const currentFiles = cloneDeep(uploader.getFilesData()) ;
      const newFiles = cloneDeep(filesData);
      const filesInUploader = currentFiles.concat(newFiles);
      const filesToUpload = [] as FileToUpload[];

      for (const file of filesInUploader as FileInfo[])
      {
        const content = await shared.getFileContentsAsBase64(file.rawFile as Blob);

        const fileToUpload: FileToUpload = {
          name: file.name,
          content: content,
          type: file.type,
          description: file.name
        };
        filesToUpload.push(fileToUpload as FileToUpload);
      }

      this.updateRequestBody([this.formId, {[this.inputData.maxAttribute]: filesToUpload}]);
    },
    removeFile(args: SelectedEventArgs) {
      shared.removeFileFromRequestBody(args, this.formId, this.inputData.maxAttribute);
    },
    isDuplicateFileName(fileName: string): boolean {
      const requestObj = this.getRequestBody;

      const doclinksArr = requestObj[this.formId][this.inputData.maxAttribute] as FileToUpload[];

      if (doclinksArr !== undefined) {
        for (let i = 0; i < doclinksArr.length; i++) {
          if ((doclinksArr[i] as FileToUpload).name.toLocaleLowerCase() === fileName.toLocaleLowerCase()) {
            return true;
          }
        }
      }

      return false;
    }
  }
});
</script>

<style lang="scss" scoped>
.file-input-container {
  padding-top: 4px;
}
</style>