<template>
  <transition name="confirm-fade">
    <div
      class="confirm"
      v-show="showFlag"
      @click.stop
    >
      <div class="confirm-wrapper">
        <div class="confirm-content">
          <p class="text">
            {{ text }}
          </p>
          <div class="operate">
            <div
              class="operate-btn left"
              @click="cancel"
            >
              {{ cancelBtnText }}
            </div>
            <div
              class="operate-btn"
              @click="confirm"
            >
              {{ confirmBtnText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'

@Component
export default class Confirm extends Vue {
  @Prop({ default: '' }) public text!: string
  @Prop({ default: '确定' }) public confirmBtnText!: string
  @Prop({ default: '取消' }) public cancelBtnText!: string

  public showFlag: boolean = false

  public show() {
    this.showFlag = true
  }

  public hide() {
    this.showFlag = false
  }

  @Emit()
  public cancel() {
    this.hide()
  }

  @Emit()
  public confirm() {
    this.hide()
  }
}
</script>

<style lang="stylus" scoped>
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

