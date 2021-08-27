<template>
  <v-row class="text-xs-center">
    <v-col align-center justify-center>
      <v-card>
        <v-card-text>
          <p class="headline">{{ translations.selectYourRequestPage }}</p>
          <div>
            <div 
              v-for="request in requestTypes"
              :key="request.id"
            >
              <v-btn
                class="select-request-buttons white--text"
                large
                color="blue darken-4"
                @click="goToRequestPage(request.id)"
              >
                {{ request.label }}
              </v-btn>
            </div>
            <div>
              <v-btn
                class="select-request-buttons white--text"
                large
                color="blue darken-4"
                to="/landingPage"
              >{{ translations.home }}</v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import * as shared from "./../../services/SharedFunctions";
import Wraxios from "./../../services/Wraxios";
import axios, { AxiosResponse } from "axios";
import { RequestTypes } from "./../../models/MiscTypes";

const wraxios = new Wraxios();

export default Vue.extend({
  data() {
    return {
      requestTypes: [] as RequestTypes[]
    };
  },
  computed: {
    ...mapGetters({
      translations: "get_translations"
    })
  },
  beforeMount() {
    this.getButtonInfo();
  },
  updated() {
    shared.setButtonWidth("select-request-buttons");
  },
  methods: {
    ...mapActions({
      showSnackbar: "do_showSnackbar"
    }),
    goToRequestPage(id: string) {
      this.$router.push(`/objectRequest?pageName=${id}`);
    },
    getRequestTypesOk(response: AxiosResponse) {
      this.requestTypes = response.data as RequestTypes[];
    },
    async getButtonInfo() {
      const callbacks = {
        200: this.getRequestTypesOk
      };

      await wraxios.get(
        axios,
        "objectRequest/selectRequestType",
        callbacks
      );
    }
  }
});
</script>
