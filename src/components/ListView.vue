<template>
  <Scroll
    class="listview"
    :data="data"
    ref="listview"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="scroll"
  >
    <ul>
      <!-- 歌手列表组 -->
      <li
        v-for="group in data"
        class="list-group"
        ref="listGroup"
        :key="group.title"
      >
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <!-- 歌手列表组里的歌手 -->
          <li
            @click="selectItem(item)"
            v-for="item in group.items"
            class="list-group-item"
            :key="item.name"
          >
            <img v-lazy="item.avatar" class="avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 锚点 -->
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          class="item"
          :class="{ current: currentIndex === index }"
          :data-index="index"
          :key="index"
        >
          {{ item }}
        </li>
      </ul>
    </div>
    <!-- 歌手组固定标题栏 -->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
    <div class="loading-container" v-show="!data.length">
      <Loading />
    </div>
  </Scroll>
</template>

<script>
import Scroll from '@/components/Scroll'
import Loading from '@/components/Loading'

import { getData } from '@/utils/dom'

// 右侧单个锚点的高度
const ANCHOR_HEIGHT = 18

// 歌曲列表 title 的高度
const TITLE_HEIGHT = 30

export default {
  components: {
    Scroll,
    Loading
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  computed: {
    // 获取歌手标题首字母列表
    shortcutList() {
      return this.data.map(group => {
        return group.title.substr(0, 1)
      })
    },

    // 固定标题栏的标题内容
    fixedTitle() {
      if (this.scrollY > 0) {
        return
      }
      return this.data[this.currentIndex]
        ? this.data[this.currentIndex].title
        : ''
    }
  },
  created() {
    this.touch = {}
    this.listenScroll = true // 监听滚动事件
    this.listHeight = [] // DOM 高度集合
    this.probeType = 3 // 滚动实时 + 动画实时
  },
  watch: {
    // 监听传入的 data 的变化，计算歌手列表每组的高度
    data() {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },

    // 监听歌手列表的 Y 轴的滚动值
    scrollY(newY) {
      const listHeight = this.listHeight

      if (newY > 0) {
        this.currentIndex = 0
        return
      }

      // 当在中间部分滚动，遍历到倒数第2个值为止，保证 height2 一定会有的
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // 获取下区间和Y轴滚动值的差值
          this.diff = height2 + newY
          return
        }
      }

      this.currentIndex = listHeight.length - 2
    },

    // 监听歌手组下区间和 Y 轴滚动值的差值变化
    diff(newVal) {
      let fixedTop =
        newVal > 0 && newVal < TITLE_HEIGHT ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      // 操作 DOM 向上移动，移动距离为固定标题栏距离顶部距离（负值）
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  methods: {
    // 监听触摸开始事件, 滚动到对应歌手列表
    onShortcutTouchStart(e) {
      const anchorIndex = getData(e.target, 'index')
      const firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },

    // 监听触摸滚动事件，滚动到对应的歌手列表
    onShortcutTouchMove(e) {
      const firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },

    refresh() {
      this.$refs.listview.refresh()
    },

    // 监听 scroll 事件
    scroll(pos) {
      this.scrollY = pos.y
    },

    selectItem(item) {
      this.$emit('select', item)
    },

    // 滚动到对应歌手列表
    _scrollTo(index) {
      // 点击锚点首尾两端的 padding 空隙时，index 为 null，此时不滚动
      if (!index && index !== 0) {
        return
      }
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },

    // 计算歌手列表高度
    _calculateHeight() {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
