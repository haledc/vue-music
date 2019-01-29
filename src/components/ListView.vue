<template>
  <Scroll
    class="list-view"
    :data="data"
    ref="listView"
    :listen-scroll="listenScroll"
    :probe-type="probeType"
    @scroll="scroll"
  >
    <ul>
      <li
        v-for="group in data"
        :key="group.title"
        class="list-group"
        ref="listGroup"
      >
        <h2 class="list-group-title">
          {{ group.title }}
        </h2>
        <ul>
          <li
            v-for="item in group.items"
            :key="item.id"
            @click="selectItem(item)"
            class="list-group-item"
          >
            <img
              v-lazy="item.avatar"
              alt="avatar"
              class="avatar"
            >
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :key="index"
          class="item"
          :data-index="index"
          :class="{'current': currentIndex === index}"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <div
      class="list-fixed"
      v-show="fixedTitle"
      ref="fixed"
    >
      <h1 class="fixed-title">
        {{ fixedTitle }}
      </h1>
    </div>
    <div
      class="loading-container"
      v-show="!data.length"
    >
      <Loading />
    </div>
  </Scroll>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import Scroll from '@/components/Scroll.vue'
import Loading from '@/components/Loading.vue'
import { getData } from '@/assets/utils/dom'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

@Component({
  components: {
    Scroll,
    Loading
  }
})
export default class ListView extends Vue {
  @Prop({ default: [] })
  public data!: any[]

  public scrollY: number = -1
  public currentIndex: number = 0
  public diff: number = -1
  public touch: any = {}
  public listenScroll: boolean = true
  public listHeight: number[] = []
  public probeType: number = 3
  public fixedTop: any
  public $refs: any

  get shortcutList() {
    return this.data.map(group => group.title.substr(0, 1))
  }

  get fixedTitle() {
    if (this.scrollY > 0) {
      return
    }
    return this.data[this.currentIndex]
      ? this.data[this.currentIndex].title
      : ''
  }

  public onShortcutTouchStart(e: any) {
    const anchorIndex = getData(e.target, 'index')
    const firstTouch = e.touches[0]
    this.touch.y1 = firstTouch.pageY
    this.touch.anchorIndex = anchorIndex
    this.scrollTo(anchorIndex)
  }

  public onShortcutTouchMove(e: any) {
    const firstTouch = e.touches[0]
    this.touch.y2 = firstTouch.pageY
    const delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) || 0
    const anchorIndex = parseInt(this.touch.anchorIndex, 10) + delta
    this.scrollTo(anchorIndex)
  }

  public refresh() {
    this.$refs.listView.refresh()
  }

  public scroll(pos: any) {
    this.scrollY = pos.y
  }

  @Emit('select')
  public selectItem(item: any) {
    // ...
  }

  @Watch('data')
  public onDataChange() {
    setTimeout(() => {
      this.calculateHeight()
    }, 20)
  }

  @Watch('scrollY')
  public onScrollYChange(newY: any) {
    const listHeight = this.listHeight
    if (newY > 0) {
      this.currentIndex = 0
      return
    }

    for (let i = 0; i < listHeight.length - 1; i++) {
      const height1 = listHeight[i]
      const height2 = listHeight[i + 1]
      if (-newY >= height1 && -newY < height2) {
        this.currentIndex = i
        this.diff = height2 + newY
        return
      }
    }

    this.currentIndex = listHeight.length - 2
  }

  @Watch('diff')
  public onDiffChange(newVal: any) {
    const fixedTop =
      newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0
    if (this.fixedTop === fixedTop) {
      return
    }
    this.fixedTop = fixedTop
    this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
  }

  private scrollTo(index: any) {
    if (!index && index !== 0) {
      return
    }
    if (index < 0) {
      index = 0
    } else if (index > this.listHeight.length - 2) {
      index = this.listHeight.length - 2
    }
    this.scrollY = -this.listHeight[index]
    this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)
  }

  private calculateHeight() {
    this.listHeight = []
    const list = this.$refs.listGroup
    let height = 0
    this.listHeight.push(height)
    for (const item of list) {
      height += item.clientHeight
      this.listHeight.push(height)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'

.list-view
  position: relative
  width: 100%
  height: 100%
  overflow: hidden
  background: $color-background

  .list-group
    padding-bottom: 30px

    .list-group-title
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background

    .list-group-item
      display: flex
      align-items: center
      padding: 20px 0 0 30px

      .avatar
        width: 50px
        height: 50px
        border-radius: 50%

      .name
        margin-left: 20px
        color: $color-text-l
        font-size: $font-size-medium

  .list-shortcut
    position: absolute
    z-index: 30
    right: 0
    top: 50%
    transform: translateY(-50%)
    width: 20px
    padding: 20px 0
    border-radius: 10px
    text-align: center
    background: $color-background-d
    font-family: Helvetica

    .item
      padding: 3px
      line-height: 1
      color: $color-text-l
      font-size: $font-size-small

      &.current
        color: $color-theme

  .list-fixed
    position: absolute
    top: 0
    left: 0
    width: 100%

    .fixed-title
      height: 30px
      line-height: 30px
      padding-left: 20px
      font-size: $font-size-small
      color: $color-text-l
      background: $color-highlight-background

  .loading-container
    position: absolute
    width: 100%
    top: 50%
    transform: translateY(-50%)
</style>
