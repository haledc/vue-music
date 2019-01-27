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
  @Prop({ default: 1 }) probeType!: number
  @Prop({ default: true }) click!: boolean
  @Prop({ default: null }) data!: string[]
  @Prop({ default: false }) listenScroll!: boolean
  @Prop({ default: false }) pullup!: boolean
  @Prop({ default: false }) beforeScroll!: boolean
  @Prop({ default: 20 }) refreshDelay!: number
  @Prop({ default: DIRECTION_V }) direction!: string

  scroll: any
  $refs: any

  mounted() {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  }

  _initScroll() {
    if (!this.$refs.wrapper) return

    this.scroll = new BScroll(this.$refs.wrapper, {
      probeType: this.probeType,
      click: this.click,
      eventPassthrough:
        this.direction === DIRECTION_V ? DIRECTION_H : DIRECTION_V
    })

    if (this.listenScroll) {
      this.scroll.on('scroll', (pos: any) => {
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

  enable() {
    this.scroll && this.scroll.enable()
  }

  disable() {
    this.scroll && this.scroll.disable()
  }

  refresh() {
    this.scroll && this.scroll.refresh()
  }

  scrollTo() {
    this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
  }

  scrollToElement() {
    this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
  }

  @Watch('data')
  onDataChange() {
    setTimeout(() => {
      this.refresh()
    }, this.refreshDelay)
  }
}
</script>