<template>
  <v-container id="inquiry-page-container">
    <v-row>
      <v-card
        id="inquiry-card"
        class="mx-auto"
        width="550"
        align-center
        justify-center  
      >
        <v-toolbar color="grey darken-3">
          <v-toolbar-title class="white--text" headline>
            {{ translations.inquiryPage }}
          </v-toolbar-title>
        </v-toolbar>

          <v-card-text>
            <div id="inquiry-page-buttons" class="text-center">
            <div v-for="(item, index) in inquiries" :key="item.key">
              <v-btn
                class="white--text inquiry-page-button"
                large
                color="blue darken-4"
                @click="searchButtonClicked(index)"
              >
                {{ item.label }}
              </v-btn>
            </div>

            <div>
              <v-btn
                class="white--text inquiry-page-button"
                color="blue darken-4"
                large
                to="/landingPage"
              >
                {{ translations.home }}
              </v-btn>
            </div>
          </div>
          </v-card-text>
      </v-card>
    </v-row>

    <data-table 
      @option-selected="goToEditPage"
      :max-attribute="editPageName"
      :form-id="editPageName"
      :is-inquiry-page-lookup="true"
      :inquiry-search-number="searchNumber"
      :translations="getTranslations"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Wraxios from "./../../services/Wraxios";
import DataTable from "./DataTable.vue";
import { 
  mapActions,
  mapGetters,
  mapMutations
} from "vuex";
import * as shared from "./../../services/SharedFunctions";
import axios, { AxiosResponse, AxiosError } from "axios";
import { 
  ButtonsResponse,
  SnackbarBody,
  SnackbarColors,
  InquiryTableResponse,
  UiButton, 
  SearchDependenciesArgs,
  GetInquiryTableInput
} from "./../../models/MiscTypes";
import { Translations } from "./../../translations/Translations";

const wraxios = new Wraxios();

export default Vue.extend({
  components: {
    "data-table": DataTable
  },
  data() {
    return {
      editPageName: "",
      inquiries: [] as UiButton[],
      dialogData: {
        headers: [],
        tableData: [],
        show: false,
        error: false,
        inputId: ""
      },
      searchNumber: 0 as number
    };
  },
  computed: {
    ...mapGetters({
      translations: "get_translations",
      lookupTableData: "get_lookupTableData",
      searchDependencies: "get_lookupTableSearchDependencies"
    }),
    getTranslations(): Translations {
      return this.translations;
    }
  },
  beforeMount() {
    this.onload();
  },
  updated() {
    // eslint-disable-next-line no-undef
    shared.setButtonWidth("inquiry-page-button");
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      setLookupTableData: "set_lookupTableData",
      setSearchDependencies: "set_lookupTableSearchDependencies",
      showOverlay: "set_showOverlay"
    }),
    // eslint-disable-next-line
    inquiryButtonsOk(response: AxiosResponse) {
      const data = response.data as ButtonsResponse;
      this.inquiries = data.buttons;
      this.editPageName = data.editPageName as string;
    },
    inquiryButtonsFailure(error: AxiosError) {
      this.$nextTick(() => this.showSnackbar({
        text: error.response?.data ||
          this.getTranslations.problemGettingInformationFromTheServer,
        color: SnackbarColors.error
      } as SnackbarBody));

      this.$router.push("/LandingPage");
    },
    async onload() {
      this.clearTableData();
      const url = `/objectLookup/InquiryPageLookups?pageName=${shared.getPageName(this.$route)}`;
      const callbacks = {
        200: this.inquiryButtonsOk,
        400: this.inquiryButtonsFailure
      };

      await wraxios.get(
        axios,
        url,
        callbacks
      );
    },
    goToEditPage(id: string) {
      this.$router.push(`/editPage?pageName=${this.editPageName}&editPageLookupNumber=${id}`);
    },
    async searchButtonOk(response: AxiosResponse) {
      this.showOverlay(false);
      const data = response.data as InquiryTableResponse;
      const tableHeaders = [] as {[key: string]: string}[];
      const searchDependenciesArgs = {
        formId: this.editPageName,
        maxAttribute: this.editPageName,
        searchDependencies: data.lookupTableSearchDependencies
      } as SearchDependenciesArgs;

      this.setSearchDependencies(searchDependenciesArgs);  

      data.headers.forEach((item, index) => 
        tableHeaders.push({text: item, value: data.fields[index]})
      );

      this.setLookupTableData({
        ...this.lookupTableData,
        show: true,
        isLoading: false,
        error: false,
        headers: tableHeaders,
        tableData: data.tableData.map(record => {
          const reportDate = new Date(record.reportdate);
          record.reportdate = `${reportDate.getUTCMonth()+1}/${reportDate.getUTCDate()}/${reportDate.getUTCFullYear()}`;
          return record;
        }),
        lookupTableRequestState: data.lookupTableRequestState,
        valueToSubmit: data.valueToSubmit
      });    
    },
    searchButtonFailure(error: AxiosError) {
      this.showOverlay(false);
      this.setLookupTableData({
        show: false,
        isLoading: false,
        headers: [],
        tableData: [],
        error: true,
        lookupTableRequestState: {},
        searchFields: {}
      });

      this.$nextTick(() => this.showSnackbar({
        text: error.response?.data ||
          this.getTranslations.problemGettingInformationFromTheServer,
        color: "error"
      } as SnackbarBody));
    },
    async searchButtonClicked(index: number) {
      this.searchNumber = index;
      this.showOverlay(true);
      this.setLookupTableData({
        ...this.lookupTableData,
        isLoading: true,
        headers: [],
        tableData: [],
        lookupTableRequestState: {}
      });

      const params = {
        pageNumber: 0,
        pageName: shared.getPageName(this.$route),
        searchNumber: index,
        searchParams: {}
      } as GetInquiryTableInput;
     
      const callbacks = {
        200: this.searchButtonOk,
        400: this.searchButtonFailure
      };

      await wraxios.post(
        axios,
        "formsData/getInquiryTableData",
        params,
        callbacks
      );
    },
    clearTableData() {
      this.setLookupTableData({
        show: false
      });
    }
  }
});
</script>

<style lang="scss" scoped>
#inquiry-card {
  margin: 30px 0;
  max-width: calc(100% - 24px);

  @include sm-max {
    margin: 0;
  }
}

.inquiry-page-button {
  margin: 8px 0;
  padding: 0 !important;
  width: 100% !important;
  max-width: 360px !important;
}
</style>
