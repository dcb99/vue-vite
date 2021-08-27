<template>
  <v-container id="edit-page-container" class="text-center mx-auto">
    <v-row>
      <v-card
        id="details-card"
        align-center
        justify-center
        class="mx-auto"
        width="750"
      >
        <v-toolbar class="white--text mx-auto" color="grey darken-3">
          <v-spacer></v-spacer>
          <v-toolbar-title class="white--text headline">
            {{ translation.detailsTitle }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <div
          v-if="showWorklogs || addNewLog"
          class="tabs-wrapper"
          shrink
        >
          <v-tabs
            v-model="tabs"
            slider-color="#6fb143"
            mandatory
          >
            <v-tab key="content">{{ translation.attributes }}</v-tab>
            <v-tab key="worklog">{{ translation.worklogs }}</v-tab>
          </v-tabs>
          <v-tabs-slider />
        </div>
        <v-container v-if="tabs === 0 && Object.keys(notesAtTopOfDetailsPage).length > 0" class="note-container note-container-top">
          <input-note
            v-for="(markdown, index) in notesAtTopOfDetailsPage"
            :key="index"
            :multiple-markdown="markdown"
          />
        </v-container>
        <v-container v-else-if="tabs === 1 && Object.keys(notesAtTopOfWorklogsPage).length > 0" class="note-container note-container-top">
          <input-note
            v-for="(markdown, index) in notesAtTopOfWorklogsPage"
            :key="index"
            :multiple-markdown="markdown"
          />
        </v-container>
        <div>
          <div v-if="tabs === 0">
            <v-card-text id="edit-page-text">
              <input-form
                id="request-details"
                v-if="detailsInputs.length >= 1"
                update-url=""
                dependencies-url=""
                dropdown-data-url=""
                lookup-table-data-url=""
                page-type="EditPage"
                :disabled="true"
                :is-editing="false"
                :multi-part-relationships="multiPartRelationships"
                :page-inputs="detailsInputs"
                :form-id="formId"
                :translations="getTranslations"
              />
            </v-card-text>
          </div>
          <div v-else-if="tabs === 1" key="worklog">
            <worklog
              v-if="showWorklogs || addNewLog"
              :key="rerenderWorklogs"
              :logs="worklogs"
              :add-log="addNewLog"
              :log-types="logTypes"
              :worklog-inputs="worklogInputs"
              :show-worklogs="showWorklogs"
              :notes-at-bottom-of-form="notesAtBottomOfWorklogsForm"
              :notes-at-top-of-form="notesAtTopOfWorklogsForm"
              @new-log-created="setWorklogs"
              :translations="getTranslations"
              :default-values="worklogDefaultValues"
            ></worklog>
          </div>
        </div>

        <v-card-actions
          v-if="tabs != 1"
          id="edit-page-button-container"
          class="text-center justify-center flex-button-container"
        >      
          <v-row>
            <v-col cols="12" class="text-center">
              <v-btn
                id="edit-page-go-back-button"
                large
                color="blue darken-3"
                class="flex-button white--text"
                @click="goBack"
              >
                {{ translation.goBack }}
              </v-btn>

              <v-btn
                id="home-button"
                class="flex-button white--text"
                large
                color="blue darken-3"
                @click="goHome"
              >
                {{ translation.home }}
              </v-btn>
            </v-col>
          </v-row>    
        </v-card-actions>
        <v-container v-if="tabs == 0 && Object.keys(notesAtBottomOfDetailsPage).length > 0" class="note-container note-container-bottom">
          <input-note
            v-for="(markdown, index) in notesAtBottomOfDetailsPage"
            :key="index"
            :multiple-markdown="markdown"
          />
        </v-container>
        <v-container v-else-if="tabs == 1 && Object.keys(notesAtBottomOfWorklogsPage).length > 0" class="note-container note-container-bottom">
          <input-note
            v-for="(markdown, index) in notesAtBottomOfWorklogsPage"
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
import Worklogs from "./Worklogs.vue";
import InputNote from "./InputNote.vue";
import * as shared from "./../../services/SharedFunctions";
import axios, { AxiosResponse, AxiosError } from "axios";
import Wraxios from "./../../services/Wraxios";
import { 
  mapActions,
  mapMutations,
  mapGetters
} from "vuex";
import { InputBase } from "./../../models/InputBase";
import { 
  EditPageResponse,
  SnackbarBody,
  SnackbarColors
} from "./../../models/MiscTypes";
import { AddPageInputs } from "./../../services/MatchInputs";
import InputForm from "./InputForm.vue";
import { MultipleMarkdown } from "../../models/MarkDown";
import isEmpty from "lodash/isEmpty";
import { Translations } from "./../../translations/Translations";

const wraxios = new Wraxios();
const matchInputs = new AddPageInputs();

export default Vue.extend({
  components: {
    worklog: Worklogs,
    "input-form": InputForm,
    "input-note": InputNote
  },
  data() {
    return {
      progressIsVisible: false as boolean,
      addNewLog: false as boolean,
      lookupNumber: "" as string,
      title: "" as string,
      tabs: 0,
      worklogs: [] as {[key: string]: string}[],
      worklogDefaultValues: [] as {[key: string]: string}[],
      logTypes: {} as {[key: string]: string}[],
      showWorklogs: false as boolean,
      rerenderWorklogs: false as boolean,
      worklogInputs: [] as InputBase[],
      detailsInputs: [] as InputBase[],
      multiPartRelationships: {},
      formId: "" as string,
      notesAtTopOfDetailsPage: {} as MultipleMarkdown,
      notesAtBottomOfDetailsPage: {} as MultipleMarkdown,
      notesAtTopOfWorklogsPage: {} as MultipleMarkdown,
      notesAtBottomOfWorklogsPage: {} as MultipleMarkdown,
      notesAtTopOfWorklogsForm: {} as MultipleMarkdown,
      notesAtBottomOfWorklogsForm: {} as MultipleMarkdown
    };
  },
  computed: {
    ...mapGetters({
      translation: "get_translations",
      getRequestBody: "get_newRequestBody",
      getDiscrepancies: "get_discrepancies",
    }),
    getTranslations(): Translations {
      return this.translation;
    }
  },
  beforeMount() {
    this.onload();
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      showOverlay: "set_showOverlay",
      setDefaultRequestBody: "set_defaultRequestBody",
      setDiscrepancies: "set_discrepancies",
    }),
    onloadOk(response: AxiosResponse) {
      const data = response.data as EditPageResponse;
      let logTypes = [] as {[key: string]: string }[];    
      this.title = data.title;

      if (data.worklogDetails !== null) {
        if (data.worklogDetails.logTypeOptions !== null) {
          logTypes = this.transformWorklogTypes(data.worklogDetails.logTypeOptions);
        }

        this.worklogs = JSON.parse(data.worklogDetails.worklogs) ?? [];
        this.addNewLog = data.worklogDetails.addNewWorklogs ?? false;
        this.logTypes = logTypes ?? {};
        this.showWorklogs = data.worklogDetails.showWorklogs ?? false;
        this.worklogInputs = data.worklogDetails.newWorklogInputs ?? [];
        this.notesAtTopOfWorklogsPage = data.worklogDetails?.notesAtTopOfPage;
        this.notesAtBottomOfWorklogsPage = data.worklogDetails?.notesAtBottomOfPage;
        this.notesAtTopOfWorklogsForm = data.worklogDetails?.notesAtTopOfForm;
        this.notesAtBottomOfWorklogsForm = data.worklogDetails?.notesAtBottomOfForm;
        this.worklogDefaultValues = data.worklogDetails.defaultValues;
      }
      
      shared.setButtonWidth("edit-page-buttons");
      matchInputs.addInput(data.detailsInputs);
      matchInputs.pageInputs.forEach(input => {
        input.label.trim();
      });
      this.detailsInputs = matchInputs.pageInputs;
      this.notesAtTopOfDetailsPage = data.notesAtTopOfPage;
      this.notesAtBottomOfDetailsPage = data.notesAtBottomOfPage;
      this.showOverlay(false);

      // If the user is visiting the details page due to submitting a new request,
      // then we should check for any discrepancies
      if (this.$route.query.submissionResult === "true") {
        const discrepancies = this.getDiscrepancies;

        if(!isEmpty(discrepancies) && discrepancies !== "{}") {
          for(const key in discrepancies) {
            // highlight fields
            const input = this.detailsInputs.find(input => input.maxAttribute === key);
            
            if(input) {
              input.isHighlighted = true;
            }

            this.showSnackbar({
              text: discrepancies[key],
              color: SnackbarColors.warn
            } as SnackbarBody);
          }
        }
      }
    },
    onloadFailure(error: AxiosError) {
      this.showOverlay(false);
      
       if (error.response?.status === 500) {
          this.$nextTick(() => this.showSnackbar({
            color: "error",
            text: this.getTranslations.problemGettingInformationFromTheServer
          }));
        } else {
          if (error instanceof Object && error.response) {
            this.$nextTick(() => this.showSnackbar({
              color: "error",
              text: error.response?.data || this.getTranslations.problemGettingInformationFromTheServer
            }));
          } else {
            this.showSnackbar({
              color: "error",
              text: this.getTranslations.problemGettingInformationFromTheServer
            });
          }
        }

        this.$router.go(-1);
    },
    async onload() {
      this.formId = shared.generateFormId(this.$router);
      this.showOverlay(true);
      this.detailsInputs = [];
      matchInputs.pageInputs = [];

      this.lookupNumber = this.$route.query.editPageLookupNumber as string;
      const callbacks = {
        200: this.onloadOk,
        400: this.onloadFailure
      };

      await wraxios.get(
        axios,
        `/objectLookup/EditPageRows?pageName=${shared.getPageName(this.$route)}&id=${this.$route.query.editPageLookupNumber}`,
        callbacks
      );
    },
    // eslint-disable-next-line
    transformWorklogTypes(worklogTypes: any) {
      const logTypes = [] as {[key: string]: string}[];
      Object.keys(worklogTypes).forEach(item => {
        logTypes.push({display: item, value: worklogTypes[item]});
      });

      return logTypes;
    },
    goBack() {
      this.$router.go(-1);
    },
    goHome() {
      this.setDefaultRequestBody();
      this.$router.push("/LandingPage");
    },
    setWorklogs(logs: {[key: string]: string}[]) {
      this.rerenderWorklogs = !this.rerenderWorklogs;
      this.worklogs = logs;
    }
  },
  destroyed() {
    this.setDefaultRequestBody();
    this.setDiscrepancies({});
  },
});

</script>

<style lang="scss" scoped>
@import "@/scss/components/_button-container";
.note-container {
  &.note-container-top {
    padding-bottom: 0;
  }
  &.note-container-bottom {
    margin-top: 0px !important;
  }
  padding-left: 30px;
  padding-right: 30px;
  margin-top: 10px;
}

#edit-page-container {
  margin: 30px 0;
  max-width: calc(100% - 24px);

  @include md-max {
    margin: 0;
  }
}

#edit-page-button-container {
  padding: 0 8%;

  @include md {
    padding: 0 14%;
  }
}

#edit-page-text {
  padding-bottom: 0;
  padding-top: 0;
  width: 100%;
}

#request-details {
  padding: 0;
}

.v-slide-group__prev, .v-slide-group__next {
  display: none !important;
}
</style>