<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot />
    </div>
    <div class="dots">
      <span
        class="dot"
        v-for="(_, index) in dots"
        :key="index"
        :class="{ active: currentPageIndex === index }"
      ></span>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import BScroll from 'better-scroll'
import { addClass } from '@/utils/dom'

@Component
export default class Slider extends Vue {
  @Prop({ default: true }) public loop!: boolean
  @Prop({ default: true }) public autoPlay!: boolean
  @Prop({ default: 2000 }) public interval!: number

  public dots: string[] = []
  public currentPageIndex: number = 0
  public slider!: BScroll
  public resizeTimer!: number
  public timer!: number
  public children!: HTMLCollection
  public $refs!: {
    sliderGroup: HTMLElement
    slider: HTMLElement
  }

  public mounted() {
    setTimeout(() => {
      this.setSliderWidth()
      this.initDots()
      this.initSlider()

      if (this.autoPlay) {
        this.play()
      }
    }, 20)

    window.addEventListener('resize', () => {
      if (!this.slider || !this.slider.enabled) {
        return
      }

      clearTimeout(this.resizeTimer)

      this.resizeTimer = setTimeout(() => {
        if (this.slider.isInTransition) {
          this.getCurrentPageIndex()
        } else {
          if (this.autoPlay) {
            this.play()
          }
        }
        this.refresh()
      }, 60)
    })
  }

  public activated() {
    if (!this.slider) {
      return
    }
    this.slider.enable()
    const pageIndex = this.slider.getCurrentPage().pageX
    this.slider.goToPage(pageIndex, 0, 0)
    this.currentPageIndex = pageIndex
    if (this.autoPlay) {
      this.play()
    }
  }

  public deactivated() {
    this.slider.disable()
    clearTimeout(this.timer)
  }

  public beforeDestroy() {
    this.slider.disable()
    clearTimeout(this.timer)
  }

  public refresh() {
    if (this.slider) {
      this.setSliderWidth(true)
      this.slider.refresh()
    }
  }

  private setSliderWidth(isResize: boolean = false) {
    this.children = this.$refs.sliderGroup.children
    let width = 0
    const sliderWidth = this.$refs.slider.clientWidth
    for (const child of this.children) {
      addClass(child, 'slider-item')
      ;(child as HTMLElement).style.width = sliderWidth + 'px'
      width += sliderWidth
    }

    if (this.loop && !isResize) {
      width += 2 * sliderWidth
    }

    this.$refs.sliderGroup.style.width = width + 'px'
  }

  private initDots() {
    this.dots = new Array(this.children.length).fill('dot')
  }

  private initSlider() {
    this.slider = new BScroll(this.$refs.slider, {
      scrollX: true,
      scrollY: false,
      momentum: false,
      snap: {
        loop: this.loop,
        threshold: 0.3,
        speed: 400
      }
    })

    this.slider.on('scrollEnd', this.getCurrentPageIndex)

    this.slider.on('touchEnd', () => {
      if (this.autoPlay) {
        this.play()
      }
    })

    this.slider.on('beforeScrollStart', () => {
      if (this.autoPlay) {
        clearTimeout(this.timer)
      }
    })
  }

  private play() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.slider.next()
    }, this.interval)
  }

  private getCurrentPageIndex() {
    const pageIndex = this.slider.getCurrentPage().pageX
    this.currentPageIndex = pageIndex
    if (this.autoPlay) {
      this.play()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

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
