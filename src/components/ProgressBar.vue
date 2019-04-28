<template>
  <div class="progress-bar" ref="progressBar" @click="onProgressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.prevent="onProgressTouchStart"
        @touchmove.prevent="onProgressTouchMove"
        @touchend="onProgressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { prefixStyle } from '@/assets/utils/dom'

const PROGRESS_BTN_WIDTH = 16
const transform: any = prefixStyle('transform')

interface Touch {
  initiated: boolean
  startX: number
  left: number
}

@Component
export default class ProgressBar extends Vue {
  @Prop({ default: 0 }) public percent!: number

  public touch = {} as Touch
  public $refs!: {
    progressBar: HTMLElement
    progress: HTMLElement
    progressBtn: HTMLElement
  }

  public onProgressTouchStart(e: TouchEvent) {
    this.touch.initiated = true
    this.touch.startX = e.touches[0].pageX
    this.touch.left = this.$refs.progress.clientWidth
  }
  public onProgressTouchMove(e: TouchEvent) {
    if (!this.touch.initiated) {
      return
    }

    const deltaX = e.touches[0].pageX - this.touch.startX
    const offsetWidth = Math.min(
      this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH,
      Math.max(0, this.touch.left + deltaX)
    )
    this.offset(offsetWidth)
    this.$emit('percentChanging', this.getPercent())
  }
  public onProgressTouchEnd() {
    this.touch.initiated = false
    this.triggerPercent()
  }

  public onProgressClick(e: MouseEvent) {
    const rect = this.$refs.progressBar.getBoundingClientRect()
    const offsetWidth = e.pageX - rect.left
    this.offset(offsetWidth)
    this.triggerPercent()
  }

  public setProgressOffset(percent: number) {
    if (percent >= 0 && !this.touch.initiated) {
      const barWidth = this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH
      const offsetWidth = percent * barWidth
      this.offset(offsetWidth)
    }
  }

  @Watch('percent')
  public onPercentChange(newPercent: number) {
    this.setProgressOffset(newPercent)
  }

  private offset(offsetWidth: number) {
    this.$refs.progress.style.width = `${offsetWidth}px`
    this.$refs.progressBtn.style[
      transform
    ] = `translate3d(${offsetWidth}px, 0, 0)`
  }

  private getPercent() {
    const barWidth = this.$refs.progressBar.clientWidth - PROGRESS_BTN_WIDTH
    return this.$refs.progress.clientWidth / barWidth
  }

  private triggerPercent() {
    this.$emit('percentChange', this.getPercent())
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'

.progress-bar
  height: 30px

  .bar-inner
    position: relative
    top: 13px
    height: 4px
    background: rgba(0, 0, 0, 0.3)

    .progress
      position: absolute
      height: 100%
      background: $color-theme

    .progress-btn-wrapper
      position: absolute
      left: -8px
      top: -13px
      width: 30px
      height: 30px

      .progress-btn
        position: relative
        top: 7px
        left: 7px
        box-sizing: border-box
        width: 16px
        height: 16px
        border: 3px solid $color-text
        border-radius: 50%
        background: $color-theme
</style>
