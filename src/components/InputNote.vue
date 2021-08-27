<template>
  <div>
    <div
      v-for="(markdown, index) in multipleMarkdown.markdown" 
      :key=index
      class="generic-input-note"
    >
      <span 
        v-if="markdown.type === 'BoldMarkdown'"
        :class="textClass(index)"
        class="bold-text"
      >
        {{ markdown.text }}
      </span>
      <span 
        v-if="markdown.type === 'ItalicMarkdown'"
        :class="textClass(index)"
        class="italic-text"
      >
        {{ markdown.text }}
      </span>
      <a 
        v-else-if="markdown.type === 'LinkMarkdown'"
        :href="markdown.url"
        :class="textClass(index)"
        target="_blank"
      >
        {{ markdown.text }}
      </a>
      <span 
        v-else-if="markdown.type === 'LiteralMarkdown'"
        :class="textClass(index)"
      >
        {{ markdown.text }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { MultipleMarkdown } from "./../../models/MarkDown";

export default Vue.extend({
  props: {
    multipleMarkdown: {
      type: Object as () => MultipleMarkdown,
      required: true
    }
  },
  methods: {
    textClass(index: number) {
      return {
        "text-with-space": index > 0,
        [this.multipleMarkdown.cssClass]: !!this.multipleMarkdown.cssClass
      };
    }
  }
});
</script>

<style lang="scss" scoped>

  div {
    display: flex;
    text-align: left;
  }

  .text-with-space {
    margin-left: 4px;
  }

  .bold-text {
    font-weight: 700;
  }

  .italic-text {
    font-style: italic;
  }

  .generic-input-note {
    padding: 0;
  }

</style>