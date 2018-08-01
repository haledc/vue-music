<template>
  <transition name="drop">
    <div class="top-tip" v-show="showFlag" @click.stop="hide">
      <slot/>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
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
        showFlag: false
      }
    },
    methods: {
      /**
       * 显示窗口，然后一段时间后关闭
       */
      show() {
        this.showFlag = true
        // 先清理定时器
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.hide()
        }, this.delay)
      },
      /**
       * 隐藏窗口
       */
      hide() {
        this.showFlag = false
      }
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .top-tip
    position: fixed
    top: 0
    width: 100%
    z-index: 500
    background: $color-dialog-background
    &.drop-enter-active, &.drop-leave-active
      transition: all 0.3s
    &.drop-enter, &.drop-leave-to
      transform: translate3d(0, -100%, 0)
</style>
