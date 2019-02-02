<template>
  <div ref="wrapper">
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import BScroll from 'better-scroll'

const DIRECTION_H = 'horizontal'
const DIRECTION_V = 'vertical'

@Component
export default class Scroll extends Vue {
  @Prop({ default: 1 }) public probeType!: number
  @Prop({ default: true }) public click!: boolean
  @Prop({ default: null }) public data!: string[]
  @Prop({ default: false }) public listenScroll!: boolean
  @Prop({ default: false }) public pullup!: boolean
  @Prop({ default: false }) public beforeScroll!: boolean
  @Prop({ default: 20 }) public refreshDelay!: number
  @Prop({ default: DIRECTION_V }) public direction!: string

  public scroll!: BScroll
  public $refs!: {
    wrapper: HTMLElement
  }

  public mounted() {
    setTimeout(() => {
      this.initScroll()
    }, 20)
  }

  public enable() {
    this.scroll && this.scroll.enable()
  }

  public disable() {
    this.scroll && this.scroll.disable()
  }

  public refresh() {
    this.scroll && this.scroll.refresh()
  }

  public scrollTo() {
    this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
  }

  public scrollToElement() {
    this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
  }

  @Watch('data')
  public onDataChange() {
    setTimeout(() => {
      this.refresh()
    }, this.refreshDelay)
  }

  private initScroll() {
    if (!this.$refs.wrapper) {
      return
    }

    this.scroll = new BScroll(this.$refs.wrapper, {
      probeType: this.probeType,
      click: this.click,
      eventPassthrough:
        this.direction === DIRECTION_V ? DIRECTION_H : DIRECTION_V
    })

    if (this.listenScroll) {
      this.scroll.on('scroll', pos => {
        this.$emit('scroll', pos)
      })
    }

    if (this.pullup) {
      this.scroll.on('scrollEnd', () => {
        if (this.scroll.y <= this.scroll.maxScrollY + 50) {
          this.$emit('scrollToEnd')
        }
      })
    }

    if (this.beforeScroll) {
      this.scroll.on('beforeScrollStart', () => {
        this.$emit('beforeScroll')
      })
    }
  }
}
</script>