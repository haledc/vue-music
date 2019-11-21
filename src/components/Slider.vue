<template>
  <div class="slider" ref="slider">
    <!--滚动图片-->
    <div class="slider-group" ref="sliderGroup">
      <!--图片插槽-->
      <slot />
    </div>
    <!--滚动圆点-->
    <div class="dots">
      <span
        class="dot"
        v-for="(item, index) in dots"
        :key="index"
        :class="{ active: currentPageIndex === index }"
      ></span>
    </div>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import { addClass } from '@/utils/dom'

export default {
  props: {
    // 是否循环
    loop: {
      type: Boolean,
      default: true
    },

    // 是否自动播放
    autoPlay: {
      type: Boolean,
      default: true
    },

    // 自动播放时间间隔
    interval: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()

      if (this.autoPlay) {
        this._play()
      }
      // 浏览器刷新时间一般为 16ms
    }, 20)

    // 监听窗口尺寸变化，改变 slider 宽度
    window.addEventListener('resize', this.onResize)
  },

  activated() {
    if (!this.slider) {
      return
    }
    this.slider.enable()
    let pageIndex = this.slider.getCurrentPage().pageX
    this.slider.goToPage(pageIndex, 0, 0)
    this.currentPageIndex = pageIndex
    if (this.autoPlay) {
      this._play()
    }
  },

  deactivated() {
    this.slider.disable()
    clearTimeout(this.timer)
  },

  beforeDestroy() {
    this.slider.disable()
    clearTimeout(this.timer)
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    // 刷新方法
    refresh() {
      if (this.slider) {
        this._setSliderWidth(true)
        this.slider.refresh()
      }
    },

    // 初始化圆点
    _initDots() {
      this.dots = new Array(this.children.length)
    },

    // 设置轮播图总长度
    _setSliderWidth(isResize) {
      // 轮播 item 列表[]
      this.children = this.$refs.sliderGroup.children

      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        // 每个子元素设置class属性
        addClass(child, 'slider-item')

        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      // 如果设置了循环播放且窗口尺寸没变，需要再加上首尾 2 个图片的宽度
      // BScroll 会在首尾克隆 2 个 DOM 保证循环播放
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },

    // 初始化轮播图
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        // 横向滚动
        scrollX: true,
        // 纵向滚动
        scrollY: false,
        // 滚动动画
        momentum: false,
        // 循环设置
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400
        }
      })

      // 监听滚动完成事件
      this.slider.on('scrollEnd', this._getCurrentPageIndex)

      // 监听触摸结束事件
      this.slider.on('touchEnd', () => {
        if (this.autoPlay) {
          this._play()
        }
      })

      // 监听滚动开始之前事件
      this.slider.on('beforeScrollStart', () => {
        if (this.autoPlay) {
          clearTimeout(this.timer)
        }
      })
    },

    // 获取当前轮播图页面索引
    _getCurrentPageIndex() {
      let pageIndex = this.slider.getCurrentPage().pageX
      this.currentPageIndex = pageIndex
      if (this.autoPlay) {
        this._play()
      }
    },

    // 自动播放轮播图方法
    _play() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.slider.next()
      }, this.interval)
    },

    // 监听 resize
    onResize() {
      if (!this.slider || !this.slider.enabled) {
        return
      }
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        if (this.slider.isInTransition) {
          this._getCurrentPageIndex()
        } else {
          if (this.autoPlay) {
            this._play()
          }
        }
        this.refresh()
      }, 60)
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

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
