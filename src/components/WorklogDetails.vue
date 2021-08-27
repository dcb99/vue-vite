<template>
  <v-row align="center" justify="center">
    <v-col
      xs8
      sm4
      lg3
    >
      <input-form
        id="worklog-details"
        v-if="pageInputs.length >= 1"
        update-url=""
        dependencies-url=""
        dropdown-data-url=""
        lookup-table-data-url=""
        page-type="EditPage"
        :disabled="true"
        :is-editing="false"
        :multi-part-relationships="multiPartRelationships"
        :page-inputs="pageInputs"
        :form-id="formId"
        :translations="translations"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions } from "vuex";
import InputForm from "./InputForm.vue";
import { AddPageInputs } from "./../../services/MatchInputs";
import Wraxios from "./../../services/Wraxios";
import axios, { AxiosResponse, AxiosError } from "axios";
import { InputBase } from "./../../models/InputBase";
import { 
  SnackbarBody,
  SnackbarColors,
  WorklogDetailsInput
} from "./../../models/MiscTypes";
import { generateFormId, getPageName } from "./../../services/SharedFunctions";
import { Translations } from "./../../translations/Translations";

const matchInputs = new AddPageInputs();
const wraxios = new Wraxios();

export default Vue.extend({
  props: {
    worklog: Object,
    translations: {
      type: Object as () => Translations,
      required: true
    }
  },
  data() {
    return {
      pageInputs: [] as InputBase[],
      multiPartRelationships: {},
      formId: "" as string
    };
  },
  components: {
    "input-form": InputForm
  },
  async beforeMount() {
    this.formId = generateFormId(this.$router);
    await this.onload(getPageName(this.$route));
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    onloadOk(response: AxiosResponse) {
      if(response.data.inputs.length < 1) {
        this.showSnackbar({
          text: this.translations.problemGettingInformationFromTheServer,
          color: SnackbarColors.error
        } as SnackbarBody);
        return;
      }

      this.pageInputs = [];
      matchInputs.pageInputs = [];

      matchInputs.addInput(response.data.inputs);
      this.pageInputs = matchInputs.pageInputs;
      this.multiPartRelationships = response.data.multipartRelationships ?? {};
    },
    onloadFailure(error: AxiosError) {
      this.showSnackbar({
        text: error.response?.data || this.translations.problemGettingInformationFromTheServer,
        color: SnackbarColors.error
      } as SnackbarBody);
    },
    async onload(pageName: string) {
      const callbacks = {
        200: this.onloadOk,
        400: this.onloadFailure
      };

      const requestBody = {
        pageName: pageName,
        worklogBody: this.worklog
      } as WorklogDetailsInput;

      await wraxios.post(
        axios,
        "objectLookup/worklogDetails",
        requestBody,
        callbacks
      );
    }
  },
});
</script>

<style scoped>
#worklog-details {
  width: 90%;
}
</style>