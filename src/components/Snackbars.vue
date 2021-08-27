<template>
  <div>
    <v-snackbar
      timeout="-1"
      v-bind="$attrs"
      v-model="snackbar.show"
      v-for="(snackbar, idx) in snackbars"
      :top="snackbar.top"
      :bottom="snackbar.bottom"
      :left="snackbar.left"
      :right="snackbar.right"
      :color="snackbar.color"
      :key="snackbar.key"
      :ref="`snackbar-${snackbar.key}`"
      :class="`v-snackbars v-snackbars-${id}-${snackbar.key}`"
      :transition="snackbar.transition"
    >
      <template v-slot:default>
        <slot :message="snackbar.message">
          {{ snackbar.message }}
        </slot>
      </template>
      <template v-slot:action>
        <slot
          name="action"
          :close="() => removeMessage(snackbar.key)"
          :id="snackbar.key"
          :index="idx"
          :message="snackbar.message"
        >
          <v-btn
            text
            @click="removeMessage(snackbar.key)"
            class="white--text"
          >
            {{ translations.close }}
          </v-btn>
        </slot>
      </template>
    </v-snackbar>
    <snackbar-style :key="key + idx" v-for="(key, idx) in keys">
      .v-snackbars.v-snackbars-{{ id }}-{{ key }} .v-snack__wrapper {
        transition: {{ topOrBottom[key] }} 500ms;
        {{ topOrBottom[key] }}: 0
      }
      .v-snackbars.v-snackbars-{{ id }}-{{ key }} > .v-snack__wrapper {
        {{ topOrBottom[key] }}: {{ positions[key] }}px;
      }
    </snackbar-style>
  </div>
</template>

<script lang="ts">
import Vue, { CreateElement, VNode } from "vue";
import { mapGetters } from "vuex";
import { Snackbar, SnackbarBody } from "../../models/MiscTypes";

export default Vue.extend({
  inheritAttrs: false,
  props: {
    messages: {
      type: Array as () => SnackbarBody[],
      default: () => [] as SnackbarBody[],
    },
    timeout: {
      type: [Number, String],
      default: 6500,
    },
    // the maximum number of snackbars per location, set to -1 for no max
    max: {
      type: [Number, String],
      default: 5,
    }
  },
  data() {
    return {
      count: 0,
      snackbars: [] as Snackbar[],
      keys: [] as string[],
      positions: {} as { [key: string]: number },
      // unique identifier for each snackbars component to avoid css collision
      id: Date.now() + Math.random().toString().slice(2),
    };
  },
  components: {
    "snackbar-style": {
      render: function (createElement: CreateElement): VNode {
        return createElement("style", this.$slots.default);
      },
    },
  },
  computed: {
    ...mapGetters({
      translations: "get_translations",
    }),
    topOrBottom() {
      const ret = {} as { [key: string]: string };
      this.snackbars.forEach((sb) => {
        ret[sb.key] = sb.top ? "top" : "bottom";
      });
      return ret;
    },
  },
  watch: {
    messages: {
      handler() {
        this.updateSnackbars();
      },
      deep: true,
    },
    snackbars() {
      // update positions of snackbars
      this.$nextTick(() => {
        const ret = {} as { [key: string]: number };
        const spaceBetweenSnackbars = 7;

        const positionMap = new Map();
        const addToMap = (key: string, value: Snackbar) =>
          positionMap.set(key, [...(positionMap.get(key) || []), value]);

        this.snackbars.forEach((s) => {
          if (s.bottom) {
            if (s.left) {
              addToMap("bottomLeft", s);
            } else if (s.right) {
              addToMap("bottomRight", s);
            } else {
              addToMap("bottomCenter", s);
            }
          } else {
            if (s.left) {
              addToMap("topLeft", s);
            } else if (s.right) {
              addToMap("topRight", s);
            } else {
              addToMap("topCenter", s);
            }
          }
        });

        for (const [, snackbars] of positionMap.entries()) {
          let position = 0;

          snackbars.reverse().forEach((s: Snackbar, idx: number) => {
            if(this.max && this.max >= 0 && idx >= this.max) {
              this.removeMessage(s.key);
            }

            // set position
            ret[snackbars[idx].key] = position;

            const height =
              document
                .querySelector(`.v-snackbars-${this.id}-${s.key}`)
                ?.querySelector(".v-snack__wrapper")?.clientHeight ?? 0;

            // set next position
            position += height + spaceBetweenSnackbars;
          });
        }

        this.positions = ret;
      });
    },
  },
  methods: {
    getProp(prop: string, i: number) {
      const messages: SnackbarBody[] = this.messages;
      return messages.length > i && typeof messages[i][prop] !== "undefined"
        ? messages[i][prop]
        : typeof this.$attrs[prop] !== "undefined"
        ? this.$attrs[prop]
        : typeof this[prop as keyof Vue] !== "undefined"
        ? this[prop as keyof Vue]
        : undefined;
    },
    updateSnackbars() {
      for (let i = this.snackbars.length; i < this.messages.length; i++) {
        // generate unique key for each snackbar
        const key = `${i}-${Date.now()}`;
        let left = this.getProp("left", i);
        let right = this.getProp("right", i);
        let top = this.getProp("top", i);
        let bottom = this.getProp("bottom", i);

        // only either top or bottom can be true, default top to true, and handle $attrs values
        top =
          top === true
            ? true
            : bottom === true
            ? false
            : top === ""
            ? true
            : bottom === ""
            ? false
            : true;
        bottom = !top;

        // similar to top and bottom but also handles center, default to center
        const l =
          left === right
            ? false
            : left === true
            ? true
            : right === true
            ? false
            : left === ""
            ? true
            : right === ""
            ? false
            : false;
        const r =
          left === right
            ? false
            : right === true
            ? true
            : left === true
            ? false
            : right === ""
            ? true
            : left === ""
            ? false
            : false;
        left = l;
        right = r;

        let transition = this.getProp("transition", i);

        if (transition === undefined) {
          transition = left
            ? "slide-x-transition"
            : right
            ? "slide-x-reverse-transition"
            : top
            ? "slide-y-transition"
            : "slide-y-reverse-transition";
        }

        this.snackbars.push({
          key: key,
          top: top,
          bottom: bottom,
          left: left,
          right: right,
          color: this.getProp("color", i) || "green",
          transition: transition,
          message: this.getProp("text", i),
          show: true,
        } as Snackbar);
        this.keys.push(key);

        // set timer to remove snackbar
        this.$nextTick(function () {
          const timeout = this.getProp("timeout", i);
          setTimeout(() => this.removeMessage(key), timeout);
        });
      }
    },
    removeMessage(key: string) {
      const idx = this.snackbars.findIndex((s) => s.key === key);

      if (idx > -1) {
        this.snackbars[idx].show = false;

        const removeSnackbar = () => {
          const idx = this.snackbars.findIndex((s) => s.key === key);
          this.snackbars.splice(idx, 1);
          this.messages.splice(idx, 1);
          Vue.delete(this.positions, key);
          this.keys.splice(idx, 1);

          // emit changes to parent
          this.$emit("update:messages", this.messages);
        };

        // backup timeout to remove snackbar if transition event doesn't get triggered
        const timeout = setTimeout(removeSnackbar, 600);

        // wait for transition to end before removing snackbar
        const refs = this.$refs[`snackbar-${key}`] as Vue[];
        refs[0].$el.addEventListener(
          "transitionend",
          () => {
            // remove snackbar and reset timer if
            // user ends transition manually by closing snackbar
            clearTimeout(timeout);
            removeSnackbar();
          },
          { once: true }
        );
      }
    },
  },
  mounted() {
    // show previously saved snackbars
    this.$nextTick(this.updateSnackbars);
  },
});
</script>