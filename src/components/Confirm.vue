<template>
  <transition name="confirm-fade">
    <!-- click.stop 阻止冒泡到引用的父组件上-->
    <div class="confirm" v-show="isShowFlag" @click.stop>
      <div class="confirm-wrapper">
        <div class="confirm-content">
          <!--描述-->
          <p class="text">{{ text }}</p>
          <!--按钮-->
          <div class="operate">
            <div @click="cancel" class="operate-btn left">
              {{ cancelBtnText }}
            </div>
            <div @click="confirm" class="operate-btn">{{ confirmBtnText }}</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    // 弹窗描述
    text: {
      type: String,
      default: ''
    },

    // 确认按钮内容
    confirmBtnText: {
      type: String,
      default: '确定'
    },

    // 取消按钮内容
    cancelBtnText: {
      type: String,
      default: '取消'
    }
  },
  data() {
    return {
      isShowFlag: false
    }
  },
  methods: {
    // 显示窗口
    show() {
      this.isShowFlag = true
    },

    // 隐藏窗口
    hide() {
      this.isShowFlag = false
    },

    // 取消选项，派发事件
    cancel() {
      this.hide()
      this.$emit('cancel')
    },

    // 确认选项，派发事件
    confirm() {
      this.hide()
      this.$emit('confirm')
    }
  }
}
</script>

<style scoped lang="stylus">
@import '~@/assets/styles/variable.styl'

.confirm
  position: fixed
  left: 0
  right: 0
  top: 0
  bottom: 0
  z-index: 998
  background-color: $color-background-d

  &.confirm-fade-enter-active
    animation: confirm-fadein 0.3s

    .confirm-content
      animation: confirm-zoom 0.3s

  .confirm-wrapper
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    z-index: 999

    .confirm-content
      width: 270px
      border-radius: 13px
      background: $color-highlight-background

      .text
        padding: 19px 15px
        line-height: 22px
        text-align: center
        font-size: $font-size-large
        color: $color-text-l

      .operate
        display: flex
        align-items: center
        text-align: center
        font-size: $font-size-large

        .operate-btn
          flex: 1
          line-height: 22px
          padding: 10px 0
          border-top: 1px solid $color-background-d
          color: $color-text-d

          &.left
            border-right: 1px solid $color-background-d

@keyframes confirm-fadein
  0%
    opacity: 0

  100%
    opacity: 1

@keyframes confirm-zoom
  0%
    transform: scale(0)

  50%
    transform: scale(1.1)

  100%
    transform: scale(1)
</style>
