<template>
  <div class="slider" ref="sliderRef">
    <!-- 滚动图片 -->
    <div class="slider-group" ref="sliderGroupRef">
      <!-- 图片插槽 -->
      <slot />
    </div>
    <!-- 定位圆点 -->
    <div class="dots">
      <span
        class="dot"
        v-for="(item, index) in state.dots"
        :key="index"
        :class="{ active: state.currentPageIndex === index }"
      ></span>
    </div>
  </div>
</template>

<script>
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  onActivated,
  onDeactivated,
} from "vue";
import BScroll from "better-scroll";
import { addClass } from "@/utils/dom";

export default {
  props: {
    loop: {
      type: Boolean,
      default: true,
    },
    autoPlay: {
      type: Boolean,
      default: true,
    },
    interval: {
      type: Number,
      default: 2000,
    },
  },
  setup(props) {
    const state = reactive({
      dots: [],
      currentPageIndex: 0,
    });

    const sliderRef = ref(null);
    const sliderGroupRef = ref(null);

    let slider, timer, resizeTimer, sliderChildren;

    onMounted(() => {
      setTimeout(() => {
        _setSliderWidth();
        _initDots();
        _initSlider();

        if (props.autoPlay) {
          _play();
        }
      }, 20);

      window.addEventListener("resize", onResize);
    });

    onUnmounted(() => {
      slider.disable();
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    });

    onActivated(() => {
      if (!slider) return;
      slider.enable();
      let pageIndex = slider.getCurrentPage().pageX;
      slider.goToPage(pageIndex, 0, 0);
      state.currentPageIndex = pageIndex;
      if (props.autoPlay) {
        _play();
      }
    });

    onDeactivated(() => {
      slider.disable();
      clearTimeout(timer);
    });

    function refresh() {
      if (slider) {
        _setSliderWidth(true);
        slider.refresh();
      }
    }

    function _initDots() {
      state.dots = new Array(sliderChildren.length);
    }

    function _setSliderWidth(isResize) {
      sliderChildren = sliderGroupRef.value.children;

      let width = 0;
      let sliderWidth = sliderRef.value.clientWidth;
      for (let i = 0; i < sliderChildren.length; i++) {
        let child = sliderChildren[i];
        addClass(child, "slider-item");
        child.style.width = sliderWidth + "px";
        width += sliderWidth;
      }
      if (props.loop && !isResize) {
        width += 2 * sliderWidth;
      }
      sliderGroupRef.value.style.width = width + "px";
    }

    function _initSlider() {
      slider = new BScroll(sliderRef.value, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: props.loop,
          threshold: 0.3,
          speed: 400,
        },
      });
      slider.on("scrollEnd", _getCurrentPageIndex);
      slider.on("touchEnd", () => {
        if (props.autoPlay) {
          _play();
        }
      });
      slider.on("beforeScrollStart", () => {
        if (props.autoPlay) {
          clearTimeout(timer);
        }
      });
    }

    function _getCurrentPageIndex() {
      let pageIndex = slider.getCurrentPage().pageX;
      state.currentPageIndex = pageIndex;
      if (props.autoPlay) {
        _play();
      }
    }

    function _play() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        slider.next();
      }, props.interval);
    }

    function onResize() {
      if (!slider || !slider.enabled) return;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (slider.isInTransition) {
          _getCurrentPageIndex();
        } else {
          if (props.autoPlay) {
            _play();
          }
        }
        refresh();
      }, 60);
    }

    return {
      state,
      sliderRef,
      sliderGroupRef,
      refresh,
    };
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/variable.scss";

.slider {
  min-height: 1px;

  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    transform: translateZ(1px);
    text-align: center;
    font-size: 0;

    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;

      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>
