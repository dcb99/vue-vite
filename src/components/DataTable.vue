<template>
  <v-dialog
    v-if="lookupTableData.show"
    v-model="lookupTableData.show"
    max-width="1000px"
    xs-sm
    lg7
    @click:outside="clearSearchFields"
  >
    <v-card>
      <v-card-text>
        <div
          v-if="showSearchFields"
          id="search-field-inputs"
          aria-owns="search-bar-inputs"
        >
          <v-container
            id="search-bar-inputs"
            v-if="searchDependencies[formId][maxAttribute]"
          >
            <v-row class="flex-input-container">
              <div
                class="flex-input"
                v-for="(value, name) in searchDependencies[formId][maxAttribute].customFilters"
                :key="name"
              >
                <v-text-field
                  :id="name"
                  v-model="searchBarInputs[name]"
                  :placeholder="value"
                  class="search-bar-items"
                  aria-labelledby="search input"
                  @keyup.enter="search"                  
                />
              </div>

              <v-btn
                color="blue darken-3"
                class="white--text flex-search-button"
                @click="search"
              >
                {{ translations.search }}
              </v-btn>
            </v-row>
          </v-container>
        </div>
      </v-card-text>

      <v-data-table
        id="lookup-table"
        :headers="lookupTableData.headers"
        :items="lookupTableData.tableData"
        :items-per-page="lookupTableData.lookupTableRequestState.pageSize"
        :loading="lookupTableData.isLoading"
        class="elevation-1"
        :hide-default-footer="lookupTableData.lookupTableRequestState != null"
        @click:row="tableRowClicked"
      >
      </v-data-table>

      <v-pagination
        class="pagination-container"
        v-if="lookupTableData.lookupTableRequestState != null"
        v-model="lookupTableData.lookupTableRequestState.pagenum"
        :length="lookupTableData.lookupTableRequestState.totalPages"
        :total-visible="8"
        @input="updatePageNumber"
      ></v-pagination>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { 
  mapActions,
  mapGetters,
  mapMutations
} from "vuex";
import Wraxios from "./../../services/Wraxios";
import axios, { AxiosResponse, AxiosError } from "axios";
import { 
  InquiryTableResponse,
  SnackbarBody,
  SnackbarColors,
  LookupTableRequestState,
  LookupTableSearchProperties,
  LookupTable,
  GetLookupTableInput,
  GetInquiryTableInput
} from "./../../models/MiscTypes";
import { Translations } from "./../../translations/Translations";
import { getPageName } from "./../../services/SharedFunctions";

const pageNameRegex = new RegExp("registration", "i");
const wraxios = new Wraxios();

export default Vue.extend({
  props: {
    formId: {
      type: String,
      required: false
    },
    maxAttribute: {
      type: String,
      required: false
    },
    isInquiryPageLookup:{
      type: Boolean,
      required: true
    },
    pageType: {
      type: String,
      required: false
    },
    pageName: {
      type: String,
      required: false
    },
    inquirySearchNumber: {
      // Inquiries on the inquiry page are held in an array to facilitate the lookup of
      // an existing record in Maximo. inquirySearchNumber corresponds to the associative 
      // value in the array and is required whenever performing lookups on the inquiry page.
      type: Number,
      required: false
    },
    translations: {
      type: Object as () => Translations,
      required: true
    }
  },
  data() {
    return {
      searchBarInputs: {} as {[key: string]: string},
      showSearchFields: false as boolean
    };
  },
  computed: {
    ...mapGetters({
      lookupTableData: "get_lookupTableData",
      lookupTableDefaultFilters: "get_lookupTableDefaultFilters",
      getRequestBody: "get_newRequestBody",
      searchDependencies: "get_lookupTableSearchDependencies"
    })
  },
  watch: {
    "$store.state.lookupTableData.show"() {
      const tableState = this.lookupTableData as LookupTable;
      this.$nextTick(() => {
        this.showSearchFields = this.searchFieldsHasLength();
      });

      if (!!tableState.show) {
        this.$nextTick(() => {
          if (!!this.showSearchFields) {
            const tableFilters = this.searchDependencies[this.formId][this.maxAttribute] as LookupTableSearchProperties;
            let defaultValues: {[key: string]: string};
            let getValueFrom: string[] | undefined;
              
            if (tableFilters && tableFilters.defaultFilters) {
              Object.keys(tableFilters.defaultFilters).forEach(key => {
                this.searchBarInputs[key] = "";
            });

            if (tableFilters.defaultFilters && tableFilters.defaultFilters.defaultValues !== null) {
              defaultValues = tableFilters.defaultFilters.defaultValues as {[key: string]: string};
              Object.keys(defaultValues).forEach(key => {
                (this.searchBarInputs as {[key: string]: string})[key] = defaultValues[key];
              });

              return;
            }         
          }

          if (tableFilters && tableFilters.defaultFilters &&
            tableFilters.defaultFilters.getValueFrom !== null) {
              getValueFrom = tableFilters.defaultFilters.getValueFrom;
              
              if (getValueFrom) {
                getValueFrom.forEach(item => {
                  (this.searchBarInputs as {[key: string]: string})[item] = this.getRequestBody[this.formId][item];
                });
              }
            }
          }     
        });
      }
    }
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      setLookupTableData: "set_lookupTableData",
      showOverlay: "set_showOverlay"
    }),    
    searchFieldsHasLength(): boolean {
      if (this.searchDependencies[this.formId] && this.searchDependencies[this.formId][this.maxAttribute]) {
        return (
          this.searchDependencies[this.formId][this.maxAttribute].customFilters &&
          Object.keys(this.searchDependencies[this.formId][this.maxAttribute].customFilters).length > 0);
        }
      
      return false;
    },
    // eslint-disable-next-line
    tableRowClicked(row: any) {
      // This is a temporary solution for a more permanent problem. workorderid won't always be the
      // unique identifier for a record.
      this.searchBarInputs = {};

      if (row.workorderid) {
        this.$emit("option-selected", row.workorderid);
      } else {
        const item = this.lookupTableData.headers.find(
          (el: HTMLInputElement) => el.value === this.lookupTableData.valueToSubmit
        );
        const index = this.lookupTableData.headers.findIndex((el: HTMLInputElement) => el === item);
        this.$emit(
          "option-selected",
          row[this.lookupTableData.headers[index].value]
        );
      }
    },
    // eslint-disable-next-line
    updatePageNumberOk(response: AxiosResponse) {
      const data = response.data as InquiryTableResponse;      
      this.setLookupTableData({
        ...this.lookupTableData,
        isLoading: false,
        tableData: data.tableData.map(record => {
          const reportDate = new Date(record.reportdate);
          record.reportdate = `${reportDate.getUTCMonth()+1}/${reportDate.getUTCDate()}/${reportDate.getUTCFullYear()}`;
          return record;
        }),
        lookupTableRequestState: data.lookupTableRequestState
      });
    },
    updatePageNumberFailure(error: AxiosError) {
      this.$nextTick(() => this.showSnackbar({
        text: error.response?.data || this.translations.problemGettingInformationFromTheServer,
          color: SnackbarColors.error
      } as SnackbarBody));

      this.setLookupTableData({
        ...this.lookupTableData,
        isLoading: false,
        tableData: [],
        lookupTableRequestState: {}
      });
    },
    async updatePageNumber(e: number) {
      this.$nextTick(() => {
          this.setLookupTableData({
          ...this.lookupTableData,
          isLoading: true
        });
      });

      const callbacks = {
        200: this.updatePageNumberOk,
        400: this.updatePageNumberFailure
      };

      const searchParams = this.getSearchFieldsAsObject() as {[key: string]: string};
      const pageName = getPageName(this.$route);     
      const url = pageNameRegex.test(pageName) ? "person/getNewPersonTableData" : "formsData/getLookupTableData";

      if (!!this.isInquiryPageLookup) {
        const params = {
          searchNumber: this.inquirySearchNumber,
          pageName: pageName,
          pageNumber: e,
          searchParams: searchParams,
          maxAttribute: this.maxAttribute
        } as GetInquiryTableInput;

        await wraxios.post(
          axios,
          "formsData/getInquiryTableData",
          params,
          callbacks
        );

        return;
      }     
  
      const params = {
        maxAttribute: this.maxAttribute,
        pageNumber: e,
        searchParams: searchParams,
        pageType: !!this.pageType ? this.pageType : "",
        pageName: pageName,
        ignoreDefaultFiltering: true
      } as GetLookupTableInput; 

      await wraxios.post(
        axios,
        url,        
        params,
        callbacks
      );    
    },
    getSearchFieldsAsObject() {
      return Array.from(document.querySelectorAll("#search-bar-inputs input"))
        .filter(x => (x as HTMLInputElement).value !== "" && (x as HTMLInputElement).value !== null)
        .reduce((acc, curr) => ({...acc, [curr.id]: (curr as HTMLInputElement).value}), {});        
    },
    async searchOk(response: AxiosResponse) {      
      const data = response.data as InquiryTableResponse;
      this.setLookupTableData({
        ...this.lookupTableData,
        isLoading: false,
        tableData: data.tableData.map(record => {
          const reportDate = new Date(record.reportdate);
          record.reportdate = `${reportDate.getUTCMonth()+1}/${reportDate.getUTCDate()}/${reportDate.getUTCFullYear()}`;
          return record;
        }),
        lookupTableRequestState: {
          pagenum: data.lookupTableRequestState.pagenum,
          totalCount: data.lookupTableRequestState.totalCount,
          totalPages: data.lookupTableRequestState.totalPages,
          pageSize: data.lookupTableRequestState.pageSize
        } as LookupTableRequestState
      });
    },
    searchFailure(error: AxiosError) {
      this.$nextTick(() => {
        this.showOverlay(false);
        this.showSnackbar({
        text: error.response?.data || this.translations.problemGettingInformationFromTheServer,
        color: SnackbarColors.error
      } as SnackbarBody);
      });     

      this.setLookupTableData({
        ...this.lookupTableData,
        isLoading: false
      });
    },
    async search() {
      this.setLookupTableData({
        ...this.lookupTableData,
        isLoading: true
      });

      const searchInputs = this.getSearchFieldsAsObject() as {[key: string]: string};
      const keys = Object.keys(searchInputs);
      const values = Object.values(searchInputs);
      const pageName = getPageName(this.$route);
      const url = pageNameRegex.test(pageName) ? "person/getNewPersonTableData" : "formsData/getLookupTableData";

      if (keys.length < 1 && values.length < 1) {
        // If keys and values are < 1, all filters have been removed and the
        // table should be reset to its default state.
        this.updatePageNumber(0);
        return;
      }  
     
      const callbacks = {
        200: this.searchOk,
        400: this.searchFailure
      };

      if (!!this.isInquiryPageLookup) {
        const params = {
          searchParams: searchInputs,
          searchNumber: this.inquirySearchNumber,
          pageName: pageName,
          pageNumber: 0,
          maxAttribute: this.maxAttribute
        } as GetInquiryTableInput;

        await wraxios.post(
          axios,
          "formsData/getInquiryTableData",
          params,
          callbacks
        );

        return;
      }

      const params = {
        searchParams: searchInputs,
        pageNumber: 0,
        maxAttribute: this.maxAttribute,
        pageType: !!this.pageType ? this.pageType : "",
        pageName: pageName,
        ignoreDefaultFiltering: true
      } as GetLookupTableInput;
      
      await wraxios.post(
        axios,
        url,
        params,
        callbacks
        
      );
    },
    clearSearchFields() {
      this.searchBarInputs = {};
    }
  }
});
</script>

<style lang="scss" scoped>

#search-bar-inputs {
  max-width: 100%;
}

.flex-input-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: 0;
  align-items: center;
  justify-content: center;
}

.flex-input {
  flex: 1 1;
  margin: 0 10px;
  
  @include md-max {
    flex-basis: 100%;
  }
}

.flex-search-button {
  flex: 0 1 94px;
  margin: 0 10px;
}

.pagination-container {
  padding: 12px;
}

</style>