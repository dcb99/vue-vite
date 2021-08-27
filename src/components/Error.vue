<template>
  <v-row class="text-xs-center mx-auto">
    <v-col>     
        <div>
        <div>
          <p id="404-text" class="display-4">404</p>
          <br />
        </div>

        <div class="display-1">
          <p>{{ translations.pageNotFound }}</p>
        </div>
        <div v-if="language === 'en'" class="subheading">
          Try going
          <span id="text-link" @click="$router.go(-1)">back</span> to the
          previous page,
          <router-link :to="'/'">log in &nbsp;</router-link>
          <span>again, or&nbsp;</span>
          <a :href="'mailto:support@projetech.com'">contact support.</a>
        </div>
        <div v-if="language !== 'en'" class="subheading">
          <span id="text-link" @click="$router.go(-1)">{{ translations.goBack }}</span>
          <br />
          <router-link :to="'/'">{{ translations.login }}</router-link>
          <br />
          <a :href="'mailto:support@projetech.com'">{{ translations.contactSupport }}</a>
        </div>
      </div>     
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      previousLink: ""
    };
  },
  computed: {
    ...mapGetters({
      translations: "get_translations",
      language: "get_language"
    })
  }
};
</script>

<style scoped>
#404-text {
  font-family: "Montserrat", sans-serif;
  text-align: left;
}

p,
.title {
  font-family: "Muli", sans-serif;
}

#text-link {
  color: #1976d2;
  cursor: pointer;
}

#text-link:hover {
  text-decoration: underline;
  color: #0056b3;
}
</style>
