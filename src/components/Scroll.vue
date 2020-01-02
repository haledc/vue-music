<template>
  <div ref="wrapper">
    <slot />
  </div>
</template>

<script>
import BScroll from 'better-scroll'

const DIRECTION_H = 'horizontal'
const DIRECTION_V = 'vertical'

export default {
  props: {
    // 探针类型(派发事件) 1滚动非实时, 2滚动实时, 3滚动实时+动画实时
    probeType: {
      type: Number,
      default: 1
    },

    // 是否可以点击
    click: {
      type: Boolean,
      default: true
    },

    // 传入的数据，监听变化，实时刷新
    data: {
      type: Array,
      default: null
    },

    // 监听滚动事件
    listenScroll: {
      type: Boolean,
      default: false
    },

    // 上拉刷新功能
    pullup: {
      type: Boolean,
      default: false
    },

    // 监听滚动之前事件
    beforeScroll: {
      type: Boolean,
      default: false
    },

    // 延迟刷新，主要用于列表动画后需要延迟刷新
    refreshDelay: {
      type: Number,
      default: 20
    },

    direction: {
      type: String,
      default: DIRECTION_V
    }
  },
  mounted() {
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  watch: {
    // 传入的 data 发生变化时刷新 BScroll 对象
    data() {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  },
  methods: {
    // 初始化 BScroll 对象
    _initScroll() {
      if (!this.$refs.wrapper) {
        return
      }
      this.scroll = new BScroll(this.$refs.wrapper, {
        // 根据父组件传来的值来设定参数
        probeType: this.probeType,
        click: this.click,
        eventPassthrough:
          this.direction === DIRECTION_V ? DIRECTION_H : DIRECTION_V
      })

      // 监听 scroll 事件，派发事件，传出实时位置
      if (this.listenScroll) {
        this.scroll.on('scroll', pos => {
          this.$emit('scroll', pos)
        })
      }

      // 监听 scrollEnd 事件，如果快要滚动到底部，派发事件
      if (this.pullup) {
        this.scroll.on('scrollEnd', () => {
          if (this.scroll.y <= this.scroll.maxScrollY + 50) {
            this.$emit('scrollToEnd')
          }
        })
      }

      // 监听 beforeScrollStart 事件【滚动之前】，派发事件，主要用于滚动前隐藏手机端输入键盘
      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },

    // 代理 BScroll 方法，下同
    enable() {
      this.scroll && this.scroll.enable()
    },

    disable() {
      this.scroll && this.scroll.disable()
    },

    refresh() {
      this.scroll && this.scroll.refresh()
    },

    scrollTo() {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },

    scrollToElement() {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  }
}
</script>
