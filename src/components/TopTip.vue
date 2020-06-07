<template>
  <transition name="drop">
    <div class="top-tip" v-show="isShowFlag" @click.stop="hide">
      <slot />
    </div>
  </transition>
</template>

<script>
import { ref, onBeforeUnmount } from "vue";

export default {
  props: {
    delay: {
      type: Number,
      default: 2000,
    },
  },
  setup(props) {
    const isShowFlag = ref(false);
    let timer;

    function show(params) {
      isShowFlag.value = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        hide();
      }, props.delay);
    }

    function hide(params) {
      isShowFlag.value = false;
    }

    onBeforeUnmount(() => {
      timer && clearTimeout(timer);
    });

    return {
      isShowFlag,
      hide,
    };
  },
};
</script>

<style scoped lang="scss">
@import "@/assets/styles/variable.scss";

.top-tip {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 500;
  background: $color-dialog-background;

  &.drop-enter-active,
  &.drop-leave-active {
    transition: all 0.3s;
  }

  &.drop-enter,
  &.drop-leave-to {
    transform: translate3d(0, -100%, 0);
  }
}
</style>
