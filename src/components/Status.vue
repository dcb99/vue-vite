
<template>
  <v-layout
    align-center
    justify-center
    column
  >
    <v-card id="status-card">
      <v-toolbar class="white--text" color="grey darken-3">
        <v-toolbar-title>Status Page</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-layout
          justify-center
          column
          align-center
        >
          <h4 id="status-message"></h4>
          <br />
          <ul id="status-list">
            <li>
              <span>Maximo connection:</span>
              <span id="maximo-connection" class="test-symbol">◌</span>
            </li>

            <li>
              <span>MaxAuth/ApiKey:</span>
              <span id="maximo-login" class="test-symbol">◌</span>
            </li>

            <li>
              <span>Background Tasks</span>
              <span id="background-services" class="test-symbol">◌</span>
            </li>
          </ul>
        </v-layout>
      </v-card-text>
      <v-card-actions>
        <v-layout align-center justify-center>
          <v-btn color="orange" @click="runTests">Run Tests</v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      testResults: {}
    };
  },
  methods: {
    async runTests() {
      const statusBoard = document.getElementById("status-message");
      statusBoard.textContent = "Running Tests";
      const el = document.getElementsByClassName("test-symbol");
      el.innerHTML = "◌";

      try {
        const response = await this.$http.get("status/runTests");
        const tests = response.data;
        let allTestsPassed = true;
        for (const elementId in tests) {
          // elementId iterates through the keys. These keys correspond to the html Ids to update
          const elementToPassOrFail = document.getElementById(elementId);

          // if test was successful
          if (tests[elementId]) {
            elementToPassOrFail.innerHTML = "✅";
          } else {
            allTestsPassed = false;
            elementToPassOrFail.innerHTML = "❌";
          }
        }

        if (allTestsPassed) {
          statusBoard.textContent = "All Tests Passed";
        } else {
          statusBoard.textContent = "Test Failed";
        }
      } catch (error) {
        statusBoard.textContent = "Error occured while running tests";
      }
    }
  }
};
</script>

<style>
#status-list {
  font-size: 130%;
}

#status-card {
  width: 500px;
}

.test-symbol {
  float: right;
  padding-left: 10px;
}
</style>
