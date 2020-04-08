<template>
  <div class="progress-bar" ref="progressBarRef" @click="progressClick">
    <div class="bar-inner">
      <!-- 进度条 -->
      <div class="progress" ref="progressRef"></div>
      <!-- 进度条按钮 -->
      <div
        class="progress-btn-wrapper"
        ref="progressBtnRef"
        @touchstart.prevent="progressTouchStart"
        @touchmove.prevent="progressTouchMove"
        @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { watch } from '@vue/composition-api'
import { prefixStyle } from '@/utils/dom'

// 按钮宽度（直径）
const PROGRESSBTNWIDTH = 16
const transform = prefixStyle('transform')

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  setup(props, { refs, emit }) {
    const touch = {}
    watch(
      () => props.percent,
      newVal => setProgressOffset(newVal)
    )

    function progressTouchStart(event) {
      touch.initiated = true
      touch.startX = event.touches[0].pageX
      touch.left = refs.progressRef.clientWidth
    }

    function progressTouchMove(event) {
      if (!touch.initiated) return
      const deltaX = event.touches[0].pageX - touch.startX
      const offsetWidth = Math.min(
        refs.progressBarRef.clientWidth - PROGRESSBTNWIDTH,
        Math.max(0, touch.left + deltaX)
      )
      _offset(offsetWidth)
      emit('percentChanging', _getPercent())
    }

    function progressTouchEnd() {
      touch.initiated = false
      _triggerPercent()
    }

    function progressClick(event) {
      const rect = refs.progressBarRef.getBoundingClientRect()
      const offsetWidth = event.pageX - rect.left
      _offset(offsetWidth)
      _triggerPercent()
    }

    function setProgressOffset(percent) {
      if (percent >= 0 && !touch.initiated) {
        const barWidth = refs.progressBarRef.clientWidth - PROGRESSBTNWIDTH
        const offsetWidth = percent * barWidth
        _offset(offsetWidth)
      }
    }

    function _triggerPercent() {
      emit('percentChange', _getPercent())
    }

    function _offset(offsetWidth) {
      refs.progressRef.style.width = `${offsetWidth}px`
      refs.progressBtnRef.style[
        transform
      ] = `translate3d(${offsetWidth}px, 0, 0)`
    }

    function _getPercent() {
      const barWidth = refs.progressBarRef.clientWidth - PROGRESSBTNWIDTH
      return refs.progressRef.clientWidth / barWidth
    }

    return {
      progressTouchStart,
      progressTouchMove,
      progressTouchEnd,
      progressClick,
      setProgressOffset
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

.progress-bar {
  height: 30px;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>
