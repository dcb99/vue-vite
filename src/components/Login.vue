<template>
  <v-container 
    align-center
    justify-center
    class="text-center">
    <v-row>
      <v-card
        id="login-card"
        class="mx-auto"
        width="500"
      >
        <v-toolbar class="white--text" color="grey darken-3">
          <v-toolbar-title class="white--text">
            {{ translations.login }}
          </v-toolbar-title>
          <v-spacer />
        </v-toolbar>

        <v-container v-if="textAbove && Object.keys(textAbove).length > 0">
          <input-note
            v-for="(markdown, index) in textAbove"
            :key="index"
            :multiple-markdown="markdown"
          />
        </v-container>

        <v-card-text>          
          <v-text-field
            id="login-textbox"
            v-model="input.userId"
            :prepend-icon="loginIcon"
            type="text"
            name="login"
            required
            autofocus
            aria-labelledby="username input"
            :placeholder="loginPlaceholderText"
            :messages="loginMessage"
            @keyup.enter="loginButtonClick"
          />
        </v-card-text>

        <v-container px-5 class="text-center">
          <div>
            <v-btn
              id="login-button"
              large
              aria-label="login button"
              block
              color="blue darken-3"
              class="white--text"
              :loading="loginLoading"
              @click.exact="loginButtonClick"
              @click.native="loader='loginLoading'"
            >
              {{ translations.login }}
            </v-btn>
          </div>

          <div v-if="isRegistrationDisabled === false" id="registration-text">
              <div v-if="language === 'en'">
                <p class="dialog-3">
                  Don't have a login? Click
                  <router-link to @click.native="goToRegistration">here</router-link>&nbsp;to register.
                </p>
              </div>

              <div v-else>
                <p class="dialog-3">
                  <router-link to @click.native="goToRegistration">
                    {{ translations.register }}
                  </router-link>
                </p>
              </div>
          </div>          

          <div v-if="textBelow && Object.keys(textBelow).length > 0">
            <input-note
              v-for="(markdown, index) in textBelow"
              :key="index"
              :multiple-markdown="markdown"
            />
          </div>
        </v-container>
      </v-card>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { MultipleMarkdown } from "./../../models/MarkDown";
import { ref, computed, nextTick, onBeforeMount } from "vue";
import { useStore, Store } from "vuex";
import { MaintReqState } from "../store/interfaces";
import router from "./../router/index";
import { setInitialState, loginButtonSuccess, loginButtonFailure } from "./../componentFunctions/login"; 
import { LoginPageData, SnackbarBody, SnackbarColors } from "../../models/miscTypes";
import { Translation } from "../translations/translations";
import axios, { AxiosError, AxiosResponse } from "axios";
import Wraxios from "./../services/Wraxios";

const wraxios = new Wraxios();

const store: Store<MaintReqState> = useStore();

const loader = ref("");
const textAbove = ref({} as MultipleMarkdown);
const textBelow = ref({} as MultipleMarkdown);
const loginLoading = ref(false);
const loginIcon = ref("");
const loginMessage = ref("");
const loginPlaceholderText = ref("");
const input = ref({userId: ""});

const translations = store.getters.get_translations as Translation;

const getUserIsAuthenticated = computed(() => store.state.userIsAuthenticated);
const maximoConnectionIssues = computed(() => store.state.maximoConnectionIssues);
const userSessionInvalidated = computed(() => store.state.userSessionInvalidated);
const isRegistrationDisabled = computed(() => store.state.isRegistrationDisabled);
const language = computed(() => store.state.langauage);

const onload = async () => {
    setInitialState(store);
    if (!!getUserIsAuthenticated.value) {
        router.push("landingPage");
        return;
    }

    if (!!maximoConnectionIssues.value) {
        store.dispatch("do_showSnackbar", {
            text: translations.problemGettingInformationFromTheServer,
            color: SnackbarColors.error,
            show: true
        } as SnackbarBody);
        store.state.maximoConnectionIssues = false;
    }

    if (!!userSessionInvalidated.value) {
        store.dispatch("do_showSnackbar", {
            text: translations.sessionHasExpired,
            color: SnackbarColors.error,
            show: true
        } as SnackbarBody);
        store.state.userSessionInvalidated = true;
    }

    const callbacks = {
        200: loginPageDataSuccess,
        500: loginPageDataFailure
    }

    await wraxios.get(
        axios,
        "account/getLoginPageData",
        callbacks
    );
}

onBeforeMount(onload);

const loginPageDataSuccess = (response: AxiosResponse) => {
    const data = response.data as LoginPageData;

    loginPlaceholderText.value = data.loginPlaceHolderText;
    textAbove.value = data.textAboveInput;
    textBelow.value = data.textBelowInput;
    loginIcon.value = data.icon;
    
    store.commit("set_isRegistrationDisabled", data.isRegistrationDisabled);

    if (data.toastMessage) {
        store.dispatch("do_showSnackbar", {
            text: data.toastMessage,
            color: data.toastColor
        } as SnackbarBody)
    }

    if (!!data.userIsLoggedIn) {
        store.commit("set_userIsAuthenticated", true);
        router.push("landingPage");
    }
}

const loginPageDataFailure = (error: AxiosError) => {
    nextTick(() => {
        store.dispatch("do_showSnackbar", {
            text: error.response?.data || translations.problemGettingInformationFromTheServer,
            color: SnackbarColors.error
        } as SnackbarBody)
    });
}

const loginButtonClick = async () => {
    loginLoading.value = true;
    const callbacks = {
        200: loginButtonSuccess,
        400: loginButtonFailure,
        401: loginButtonFailure,
        500: loginButtonFailure
    };

    await wraxios.post(
        axios,
        "account/authenticateUser",
        input.value,
        callbacks
    );
}

const goToRegistration = () => {
    router.push("registration");
}
</script>