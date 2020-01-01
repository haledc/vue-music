<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <!-- 进度条 -->
      <div class="progress" ref="progress"></div>
      <!-- 进度条按钮 -->
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
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
import { prefixStyle } from '@/utils/dom'

// 按钮宽度（直径）
const PROGRESSBTNWIDTH = 16
const transform = prefixStyle('transform')

export default {
  props: {
    // 歌曲播放时间和总时长的百分比
    percent: {
      type: Number,
      default: 0
    }
  },
  created() {
    this.touch = {}
  },
  watch: {
    // 监听百分比变化，根据百分比变化设置进度条实时宽度 -> 移动按钮
    percent(newPercent) {
      this.setProgressOffset(newPercent)
    }
  },
  methods: {
    // 监听 touchStart 事件，记录初始数值
    progressTouchStart(e) {
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
    },

    // 监听 touchMove 事件，记录数值变化
    progressTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      // X 轴偏移数值
      const deltaX = e.touches[0].pageX - this.touch.startX
      // X 轴偏移宽度
      const offsetWidth = Math.min(
        this.$refs.progressBar.clientWidth - PROGRESSBTNWIDTH,
        Math.max(0, this.touch.left + deltaX)
      )
      // 设置按钮偏移到指定位置
      this._offset(offsetWidth)
      this.$emit('percentChanging', this._getPercent())
    },

    // 监听 touchEnd 事件, 重置为未初始化，派发事件
    progressTouchEnd() {
      this.touch.initiated = false
      this._triggerPercent()
    },

    // 监听进度条点击事件，获取点击的偏移位置，并派发事件
    progressClick(e) {
      // 获取进度条在屏幕的位置
      const rect = this.$refs.progressBar.getBoundingClientRect()
      // 偏移位置
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      this._triggerPercent()
    },

    // 设置进度条的实时宽度和按钮的偏移
    setProgressOffset(percent) {
      // 在初始化为 false 时才能设置，不会和监听 touchMove 事件的方法冲突
      if (percent >= 0 && !this.touch.initiated) {
        // 进度条总长度
        const barWidth = this.$refs.progressBar.clientWidth - PROGRESSBTNWIDTH
        // 进度条的当前位置
        const offsetWidth = percent * barWidth
        this._offset(offsetWidth)
      }
    },

    // 派发实时的进度条百分比
    _triggerPercent() {
      this.$emit('percentChange', this._getPercent())
    },

    // 进度条实时宽度和按钮的偏移操作方法
    _offset(offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[
        transform
      ] = `translate3d(${offsetWidth}px, 0, 0)`
    },

    // 获取实时的进度条百分比
    _getPercent() {
      const barWidth = this.$refs.progressBar.clientWidth - PROGRESSBTNWIDTH
      return this.$refs.progress.clientWidth / barWidth
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
