<template>
  <div ref="wrapperRef">
    <slot />
  </div>
</template>

<script>
import { onMounted, watch, ref } from "vue";
import BScroll from "better-scroll";

const DIRECTION_H = "horizontal";
const DIRECTION_V = "vertical";

export default {
  props: {
    probeType: {
      type: Number,
      default: 1,
    },
    click: {
      type: Boolean,
      default: true,
    },
    data: {
      type: Array,
      default: null,
    },
    listenScroll: {
      type: Boolean,
      default: false,
    },
    pullup: {
      type: Boolean,
      default: false,
    },
    beforeScroll: {
      type: Boolean,
      default: false,
    },
    refreshDelay: {
      type: Number,
      default: 20,
    },
    direction: {
      type: String,
      default: DIRECTION_V,
    },
  },
  setup(props, { emit }) {
    let scroll;

    const wrapperRef = ref(null);

    onMounted(() => {
      setTimeout(() => {
        _initScroll();
      }, 20);
    });

    function _initScroll() {
      if (!wrapperRef.value) return;
      scroll = new BScroll(wrapperRef.value, {
        probeType: props.probeType,
        click: props.click,
        eventPassthrough:
          props.direction === DIRECTION_V ? DIRECTION_H : DIRECTION_V,
      });
      if (props.listenScroll) {
        scroll.on("scroll", (pos) => emit("scroll", pos));
      }
      if (props.pullup) {
        scroll.on("scrollEnd", () => {
          if (scroll.y <= scroll.maxScrollY + 50) {
            emit("scrollEnd");
          }
        });
      }
      if (props.beforeScroll) {
        scroll.on("beforeScrollStart", () => emit("beforeScroll"));
      }
    }

    function enable() {
      scroll && scroll.enable();
    }

    function disable() {
      scroll && scroll.disable();
    }

    function refresh() {
      scroll && scroll.refresh();
    }

    function scrollTo() {
      scroll && scroll.scrollTo.apply(scroll, arguments);
    }

    function scrollToElement() {
      scroll && scroll.scrollToElement.apply(scroll, arguments);
    }

    return {
      wrapperRef,
      enable,
      disable,
      refresh,
      scrollTo,
      scrollToElement,
    };
  },
};
</script>
