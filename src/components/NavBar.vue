<template>
  <div>
    <v-app-bar
      id="app-toolbar"
      app
      clipped
      color="grey darken-3"
      class="white--text"
      height="88px"
    >
      <v-toolbar-title
        id="app-toolbar-text"
        class="display-1"
      >
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-toolbar-items id="toolbar-items" class="hidden-sm-and-down">
        <span class="nav-bar-item">
          <v-select
            v-if="Object.keys(languages).length > 1"
            id="language-select"
            :items="languages"
            dark
            aria-label="select language"
            :value="language"
            color="green"
            menu-props="{maxWidth: '50px'}"
            @change="switchLanguage"
          ></v-select>
        </span>

        <span class="nav-bar-item">
          <v-btn
            v-if="getUserIsAuthenticated"
            text
            exact
            class="white--text"
            @click.native="goHome"
          >
            {{ translations.home }}
          </v-btn>
          <v-btn
            v-if="getUserIsAuthenticated"
            text
            exact
            class="white--text"
            @click.exact="logout"
          >
            {{ translations.logout }}
          </v-btn>
        </span>
        
      </v-toolbar-items>
      <v-app-bar-nav-icon
        v-on:click="drawer = !drawer"
        v-if="getUserIsAuthenticated"
        class="white--text hidden-md-and-up"></v-app-bar-nav-icon>
      <v-navigation-drawer
        v-if="getUserIsAuthenticated"
        v-model="drawer"
        absolute
        right
        app
        temporary>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          v-on:click="item.onClick"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <template v-slot:append>
        <div class="pa-2">
          <v-btn block text v-on:click="drawer = !drawer">
            <v-icon left>mdi-close</v-icon>
            Close
          </v-btn>
        </div>
      </template>
      </v-navigation-drawer>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { 
  mapActions,
  mapGetters,
  mapMutations
} from "vuex";
import axios from "axios";
import Wraxios from "./../../services/Wraxios";
import { logUserOut } from "./../../services/SharedFunctions";

const wraxios = new Wraxios();

export default Vue.extend ({
  data() {
    return {
      drawer: null,
      items: [] as {
        title: string;
        icon: string;
        onClick: Function;
      }[],
    };
  },
  props: {
    languages: { type: Array, required: true },
    title: { type: String, required: true }
  },
  computed: {
    ...mapGetters({
      getUserSessionHash: "get_userSessionHash",
      getUserIsAuthenticated: "get_userIsAuthenticated",
      translations: "get_translations",
      language: "get_language"
    })
  },
  beforeMount() {
    this.items = [
        { title: "Home", icon: "mdi-home", onClick: this.goHome },
        { title: "Logout", icon: "mdi-logout", onClick: this.logout }
    ];
  },
  methods: {
    ...mapActions({
      setSessionHash: "do_setSessionHash",
      setUserIsAuthenticated: "do_setUserIsAuthenticated",
      showToast: "do_showSnackbar"
    }),
    ...mapMutations({
      setLanguage: "set_language",
      showOverlay: "set_showOverlay"
    }),
    async logout() {
      logUserOut(this.$router, false);
    },
    async switchLanguage(language: string) {  
      this.showOverlay(true);
      
      if (this.language !== language) {
        this.setLanguage(language);
        const payload = {language: language};

        await wraxios.post(
          axios,
          `/account/translations?language=${language}`,
          payload,
          {}
        );

        this.$router.go(0);
      }
    },
    goHome() {
      this.$router.push("/LandingPage");
    }
  }
});
</script>

<style lang="scss">
.nav-bar-item {
  margin-top: 21px;
}

#language-select {
  width: 100px;
}

#app-toolbar-text {
  font-family: "Lato", sans-serif !important;
  font-size: 1.5rem !important;

  @include rwd(400) {
    font-size: 2.125rem !important;
  }
}
</style>
