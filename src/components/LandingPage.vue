<template>
  <v-container
    id="landing-page-container"
    align-center
    justify-center
    class="text-center"
  >
    <v-row>
      <v-card
        id="landing-page-card"
        class="mx-auto"
        width="550"
        justify-center
        align-center
      >
        <v-card-text>
          <p class="headline">{{ greeting }}</p>
          <div id="landing-page-buttons" class="text-center">
            <div v-for="(item, index) in buttons" :key="item.key">
              <v-btn
                class="white--text landing-page-button"
                large
                color="blue darken-4"
                @click="buttonClicked(index)"
              >
                {{ item.label }}
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { 
  mapGetters,
  mapActions,
  mapMutations
} from "vuex";
import * as shared from "./../../services/SharedFunctions";
import { getMissingPersonAttributes } from "./../../services/RouterHelpers";
import axios, { AxiosResponse, AxiosError } from "axios";
import Wraxios from "./../../services/Wraxios";
import {
  SnackbarBody,
  SnackbarColors,
  UiButton,
  ButtonsResponse,
  UserData
} from "../../models/MiscTypes";
import { Translation } from "translations/Translations";

const wraxios = new Wraxios();

export default Vue.extend({
  data() {
    return {
      buttons: [] as UiButton[],
      greeting: "" as string // Translation always supplied from server
    };
  },
  computed: {
    ...mapGetters({
      getSessionHash: "get_userSessionHash",
      getUserIsAuthenticated: "get_userIsAuthenticated",
      getUserData: "get_userData",
      translations: "get_translations"
    }),
    getTranslations(): Translation {
      return this.translations;
    }
  },
  beforeMount() {
    // The only time getUserIsAuthenticated and getSessionHash should be
    // falsy is during registration workflows after a hard redirect from
    // the server. However, should these values become falsy, the back end
    // handles making sure the user has a valid session before returning data. 
    if (!this.getUserIsAuthenticated && !this.getSessionHash) {
      this.checkForNewUserRegistrationSession();
    }
   
    this.onload();
  },
  methods: {
    ...mapActions({
      showToast: "do_showSnackbar",
      setUserData: "do_setUserData",
      setUserIsAuthenticated: "do_setUserIsAuthenticated",
      setUserSessionHash: "do_setUserSessionHash",
      setUserLoginTime: "do_setUserLoginTime",
      showSnackbar: "do_showSnackbar"
    }),
    ...mapMutations({
      setMissingRequired: "set_missingRequiredAttributes",
      showOverlay: "set_showOverlay"
    }),
    async onload() {
      this.showOverlay(true);
      
      await this.checkMissingRequiredAttributes();
      await this.getLandingPageButtonsHtml();    

      await this.$nextTick(() => {
        shared.setButtonWidth("landing-page-button");
      });
    },
    newUserRegistrationSuccessful(response: AxiosResponse) {
      const data = response.data as UserData;

      this.setUserData(data.person.personAttributes);
      this.setUserIsAuthenticated(true);
      this.setUserSessionHash(data.userSessionData.sessionHash);
      this.setUserLoginTime(data.userSessionData.lastLoggeedInTime);     
    },
    newUserRegistrationFailure(error: AxiosError) {
      this.showToast({
        text: error.response?.data || this.getTranslations.problemConfirmingLoginStatus,
        color: SnackbarColors.error
      } as SnackbarBody);
      
      shared.logUserOut(this.$router, true);
    },
    async checkForNewUserRegistrationSession() {   
      const url =  "account/GetUserData";
      const callbacks = {
        200: this.newUserRegistrationSuccessful,
        400: this.newUserRegistrationFailure
      };

      await wraxios.get(
        axios,
        url,
        callbacks
      );      
    },
    async checkMissingRequiredAttributes() {
      // If there are any required attributes on the person record that are missing,
      // redirect to the profile page so the user can update their missing information.
      const missingAttributes = await getMissingPersonAttributes(new Wraxios());    

      if (missingAttributes.length > 0) {
        try {
          this.setMissingRequired(missingAttributes);
          this.$router.push("UserProfile");
        } catch {}
      }
    },
    landingPageButtonsOk(response: AxiosResponse) {
      this.showOverlay(false);
      const data = response.data as ButtonsResponse;

      this.buttons = data.buttons;
      this.greeting = data.title;

      const logoutButton = document.getElementById("logout-button");

      if (logoutButton) {
        logoutButton.addEventListener("click", this.logout);
      }
    },
    landingPageButtonsFailure(error: AxiosError) {
      this.showOverlay(false);
      this.showSnackbar({
        text: error.response?.data || this.getTranslations.unableToGetContentFromServer,
        color: SnackbarColors.error
      } as SnackbarBody);
      this.$router.push("/");
    },
    async getLandingPageButtonsHtml() {
      const url = "account/GetLandingPageButtons";
      const callbacks = {
        200: this.landingPageButtonsOk,
        400: this.landingPageButtonsFailure
      };

      await wraxios.get(
        axios, 
        url,
        callbacks
      );      
    },
    async logout() {
      shared.logUserOut(this.$router, false);
    },
    async buttonClicked(index: number) {
      const button: UiButton = this.buttons[index];

      if (button.type === "link") {
        this.$router.push(button.value);
      } else if (button.type === "logout") {
        this.logout();
      }
    }
  }
});
</script>

<style lang="scss">
#landing-page-card {
  margin: 30px 0;
  max-width: calc(100% - 24px);

  @include sm-max {
    margin: 0;
  }
}

.landing-page-button {
  margin: 8px 0;
  padding: 0 !important;
  width: 100% !important;
  max-width: 246px !important;
}
</style>
