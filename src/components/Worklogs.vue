<template>
  <v-container
    align-center
    justiyf-center
    fluid
  >
    <v-row>
      <v-data-table
        id="worklogs-table"
        :items="formattedLogs"
        :headers="headers"
        item-key="worklogid"
        :no-data-text="translations.noDataAvailable"
        show-expand
        :footer-props="{
          showFirstLastPage: true,
          itemsPerPageText: translations.rowsPerPage
        }"
      >
        <template v-slot:items="props">
          <tr>
            <td class="text-xs-center dropdown-row">
              <v-btn
                flat
                icon
                @click="expandRow(props)"
              >
                <v-icon v-if="props.expanded">expand_more</v-icon>
                <v-icon v-else>expand-less</v-icon>
              </v-btn>
            </td>

            <td class="text-xs-left">
              {{ new Date(props.item.createdate).toDateString() }}
            </td>
            <td class="text-xs-left">{{ props.item.createby }}</td>
            <td class="text-xs-left">{{ props.item.description }}</td>
            <td class="text-xs-left">{{ props.item.type }}</td>
          </tr>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <worklog-details :worklog="item" :translations="translations" />
          </td>
        </template>
      </v-data-table>
    </v-row>

    <v-row id="new-worklogs-buttons" class="text-center justify-center flex-button-container">
      <v-btn
        v-if="addLog"
        id="new-worklog-button"
        color="blue darken-3 white--text"
        class="flex-button add-log-button"
        large
        @click.native="newLog"
      >
        {{ translations.newWorklog }}
      </v-btn>
    </v-row>

    <v-dialog
      v-if="showWorklogsDialog"
      v-model="showWorklogsDialog"
      width="600"
      persistent
    >
      <v-card id="new-worklogs-card">
        <v-toolbar class="white--text" color="grey darken-3">
          <v-toolbar-title class="text-center">
            {{ translations.newWorklog }}
          </v-toolbar-title>
        </v-toolbar>

        <v-container v-if="notesAtTopOfForm && Object.keys(notesAtTopOfForm).length > 0" class="note-container">
          <input-note
            v-for="(markdown, index) in notesAtTopOfForm"
            :key="index"
            :multiple-markdown="markdown"
          />
        </v-container>

        <input-form
          :key="showWorklogsDialog"
          id="new-worklogs-form"
          dependencies-url="/objectRequest/getDependencies"
          dropdown-data-url="/formsData/worklogTypes"
          lookup-table-data-url="/formsData/getLookupTableData"
          update-url=""
          page-type="EditPage"
          :is-editing="true"
          :disabled="false"
          :worklog-types="logTypes"
          :page-inputs="pageInputs"
          :multi-part-relationships="{}"
          :form-id="formId"
          :is-new-worklog="true"
          @enterKeyPressed="submitNewWorklog"
          :translations="translations"
        />

        <v-row align-center justify-center>
          <div id="worklogs-buttons" class="text-center justify-center flex-button-container">
            <v-btn 
              id="cancel-add-worklog-button"
              @click="cancelAddWorklog"
              color="blue darken-3"
              class="white--text new-worklog-buttons flex-button"
              large
            >{{ translations.cancel }}</v-btn>
            <v-btn
              color="blue darken-3"
              class="white--text new-worklog-buttons flex-button"
              large
              :loading="saveNewLogsLoading"
              @click="submitNewWorklog"
            >{{ translations.save }}</v-btn>
          </div>
        </v-row>
        <v-container v-if="notesAtBottomOfForm && Object.keys(notesAtBottomOfForm).length > 0" class="note-container">
          <input-note
            v-for="(markdown, index) in notesAtBottomOfForm"
            :key="index"
            :multiple-markdown="markdown"
          />
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>  
</template>

<script lang="ts">
import Vue from "vue";
import InputForm from "./InputForm.vue";
import InputNote from "./InputNote.vue";
import WorklogDetails from "./../components/WorklogDetails.vue";
import { 
  mapGetters,
  mapActions,
  mapMutations
} from "vuex";
import cloneDeep from "lodash/cloneDeep";
import { MultipleMarkdown } from "../../models/MarkDown";
import { 
  SnackbarBody,
  SnackbarColors,
  WorklogDetailsInput 
} from "../../models/MiscTypes";
import axios, { AxiosResponse, AxiosError } from "axios";
import { InputBase } from "./../../models/InputBase";
import Wraxios from "./../../services/Wraxios";
import * as shared from "./../../services/SharedFunctions";
import { Translations } from "./../../translations/Translations";

const wraxios = new Wraxios();

export default Vue.extend({
  components: {
    "input-form": InputForm,
    "input-note": InputNote,
    "worklog-details": WorklogDetails
  },
  props: {
    logs: {
      type: Array,
      required: true
    },
    logTypes: {
      type: Array,
      required: true
    },
    addLog: Boolean,
    worklogInputs: Array as () => InputBase[],
    updateUrl: {
      type: String,
      required: false
    },
    notesAtTopOfForm: {} as () => MultipleMarkdown,
    notesAtBottomOfForm: {} as () => MultipleMarkdown,
    showWorklogs: Boolean,
    translations: {
      type: Object as () => Translations
    },
    defaultValues: {} as () => {[key: string]: string}[]
  },
  data() {
    return {
      expand: false as boolean,
      showWorklogsDialog: false as boolean,
      expandedRow: {},
      formattedLogs: [] as {[key: string]: string}[],
      headers: [] as {[key: string]: string}[],
      saveNewLogsLoading: false as boolean,
      pageInputs: [] as InputBase[],
      formId: "" as string
    };
  },
  computed: {
    ...mapGetters({
      getRequestBody: "get_newRequestBody"
    }),
    getTranslations(): Translations {
      return this.translations;
    }
  },
  beforeMount() {
    this.saveNewLogsLoading = false;    
    this.formattedLogs = cloneDeep(this.logs) as {[key: string]: string}[];
    // Transform dates to be human-readable
    this.formattedLogs.forEach(log => {
      log.createdate = `${new Date(
        log.createdate
      ).toLocaleDateString()} ${new Date(log.createdate).toLocaleTimeString()}`;
    });

    this.headers = [
      {
        text: "",
        value: "",
        align: "right"
      },
      {
        text: this.getTranslations.dateCreated,
        value: "createdate",
        align: "left"
      },
      {
        text: this.getTranslations.createdBy,
        value: "createby",
        align: "left"
      },
      {
        text: this.getTranslations.summary,
        value: "description",
        align: "left"
      },
      {
        text: this.getTranslations.type,
        value: "logtype",
        align: "left"
      }
    ];  
    
    this.pageInputs = cloneDeep(this.worklogInputs);
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      showOverlay: "set_showOverlay",
      updateNewRequestBody: "update_newRequestBody",
    }),
    newLog() {
      // We generate a new form id every time we create a new log because closing the input form will call the inputform's
      // destroy hook which removes the formId from the store.
      this.formId = shared.generateFormId(this.$router);
      this.updateNewRequestBody([this.formId, this.defaultValues]);

      if (this.worklogInputs.length < 1) {
        this.showSnackbar({
          text: this.getTranslations.problemLoadingTheForm,
          color: SnackbarColors.error
        } as SnackbarBody);
      }

      this.showWorklogsDialog = true;
    },
    cancelAddWorklog() {
      this.saveNewLogsLoading = false;
      this.showWorklogsDialog = false;
    },
    worklogSuccess(response: AxiosResponse) {
      this.saveNewLogsLoading = false;
      this.showWorklogsDialog = false;

      this.showSnackbar({
        text: this.translations.newWorklogAdded,
        color: SnackbarColors.success
      } as SnackbarBody);

      if (!!this.showWorklogs) {
        this.$emit("new-log-created", response.data.worklog);
      }   
    },
    worklogFailure(error: AxiosError) {
      this.saveNewLogsLoading = false;
      const updatedInputs = shared.badInput(error, this.worklogInputs, this.formId) as InputBase[];

      if (!shared.arraysAreSameLength(
        updatedInputs,
        this.worklogInputs,
        this.translations.problemSubmittingNewWorklog)) {
        return;
      }

      // The worklogInputs object needs to be refreshed in
      // order for the inputs to pick up on changes to the
      // isErrorState property. 
      this.pageInputs = updatedInputs;
    },
    async submitNewWorklog() {      
      this.saveNewLogsLoading = true;
      const missingInputsResult = this.checkForMissingInputs();

      if (missingInputsResult !== "") {
        this.stopNewSubmission();
        return;
      }
       
      if (Object.values(this.getRequestBody[this.formId]).every((value) => value === "") ||
        Object.keys(this.getRequestBody[this.formId]).length < 1) {
        this.stopNewSubmission();
        return;
      }

      const callbacks = {
        200: this.worklogSuccess,
        400: this.worklogFailure
      };

      await wraxios.post(
        axios,
        "/objectRequest/NewWorklog",
        {
          worklogBody: this.getRequestBody[this.formId],
          pageName: shared.getPageName(this.$route)
        } as WorklogDetailsInput,
        callbacks
      );
    },
    // eslint-disable-next-line
    expandRow(props: any) {
      props.expanded = !props.expanded;
    },
    stopNewSubmission() {
      this.saveNewLogsLoading = false;
      this.showSnackbar({
        text: this.translations.pleaseCompleteTheForm,
        color: SnackbarColors.warn
      } as SnackbarBody);
      this.saveNewLogsLoading = false;
      return;
    },

    checkForMissingInputs() {
      return shared.checkForMissingInputs(this.pageInputs, this.formId);
    },
  }
});
</script>

<style lang="scss" scoped>
@import "@/scss/components/_button-container";

#worklogs-table {
  width: 100%;
}

#new-worklogs-card{
  overflow-x: hidden;
}

#new-worklogs-form {
  padding-bottom: 0;
  padding-top: 0;
}

#worklogs-buttons {
  padding: 0 8%;

  @include md {
    padding: 0 14%;
  }
}

#new-worklogs-buttons {
  margin: 10px 0;
}

.add-log-button {
  max-width: 180px;
}
</style>