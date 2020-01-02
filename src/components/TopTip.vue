<template>
  <transition name="drop">
    <div class="top-tip" v-show="isShowFlag" @click.stop="hide">
      <slot />
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    // 显示持续时间
    delay: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
      isShowFlag: false
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  },
  methods: {
    // 显示窗口，然后一段时间后关闭
    show() {
      this.isShowFlag = true
      // 先清理定时器
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.hide()
      }, this.delay)
    },

    // 隐藏
    hide() {
      this.isShowFlag = false
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

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
