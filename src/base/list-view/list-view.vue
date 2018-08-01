<template>
  <scroll class="listview"
          :data="data"
          ref="listview"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll">
    <ul>
      <!--歌手列表组-->
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <!--歌手列表组里的歌手-->
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img v-lazy="item.avatar" class="avatar"/>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--锚点-->
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item,index) in shortcutList"
            class="item"
            :class="{'current':currentIndex===index}"
            :data-index="index">
          {{item}}
        </li>
      </ul>
    </div>
    <!--歌手组固定标题栏-->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div class="loading-container" v-show="!data.length">
      <loading/>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getData} from 'common/js/dom'

  // 右侧每个锚点的高度
  const ANCHOR_HEIGHT = 18
  // 歌曲列表title的高度
  const TITLE_HEIGHT = 30

  export default {
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      }
    },
    created() {
      // 为了touchstart和touchmove事件之间传值，不用在data中设置
      this.touch = {}
      // 监听滚动事件
      this.listenScroll = true
      // DOM高度集合
      this.listHeight = []
      // 滚动实时+动画实时
      this.probeType = 3
    },
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      /**
       * 获取歌手标题首字母列表
       */
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      /**
       * 固定标题栏的标题内容
       */
      fixedTitle() {
        if (this.scrollY > 0) {
          return
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      /**
       * 监听触摸开始事件, 滚动到对应歌手列表
       * @param e
       */
      onShortcutTouchStart(e) {
        // 获取data-index的数据
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0]
        // 初始Y轴的位置
        this.touch.y1 = firstTouch.pageY
        // 初始锚点
        this.touch.anchorIndex = anchorIndex
        // 滚动到对应的歌手列表
        this._scrollTo(anchorIndex)
      },
      /**
       * 监听触摸滚动事件，滚动到对应的歌手列表
       * @param e
       */
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        // 滚动锚点时 Y轴的位置
        this.touch.y2 = firstTouch.pageY
        // 滚动锚点时 偏移了几个锚点
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        // 然后计算出滚动锚点时，滚到的锚点的具体位置
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        // 滚动到对应的歌手列表
        this._scrollTo(anchorIndex)
      },
      /**
       * 调用子组件scroll刷新方法
       */
      refresh() {
        this.$refs.listview.refresh()
      },
      /**
       * 接受子组件传过来的滚动实时Y轴值
       */
      scroll(pos) {
        this.scrollY = pos.y
      },
      /**
       * 选择歌曲
       * 只派发事件
       * @param item
       */
      selectItem(item) {
        this.$emit('select', item)
      },
      /**
       * 滚动到对应歌手列表
       * @param index
       * @private
       */
      _scrollTo(index) {
        // 点击锚点首尾2端的padding空隙时，index为null，此时不滚动
        if (!index && index !== 0) {
          return
        }
        // 处理index超出边界，因为touchmove时，首尾2端可能会超出边界
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        // 锚点高亮不依赖于点击，需要手动设置此时Y轴的位置
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      /**
       * 计算歌手列表每组的高度
       * 注意：因为最前面的一个是0值，所以列表的元素比描点的元素会多了一个 ★
       * @private
       */
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
    },
    watch: {
      /**
       * 监听data的变化，计算歌手列表每组的高度
       */
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      /**
       * 监听歌手列表的Y轴的滚动值，判断滚动的Y轴数值落在哪个列表高度的区间
       * 从而获取当前区间的索引
       * 注意向下滚动时，Y轴滚动值为负值； 向上滚动时，Y轴滚动值为正值 ★
       * @param newY
       */
      scrollY(newY) {
        const listHeight = this.listHeight

        // 当向上滚动时，即滚动到顶部时，newY>0，区间始终落在索引0上
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 当在中间部分滚动，遍历到倒数第2个值为止，保证height2一定会有的
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
        // 当滚到到底部，且-newY大于最后一个元素的上限，
        // 又因为高度列表长度本来就比锚点多一个，所以最后是减2
        // 即length-1是为最后一个index元素，然后又因为高度列表长度比锚点多1，所以再减一个1 ★
        this.currentIndex = listHeight.length - 2
      },
      /**
       * 监听歌手组下区间和Y轴滚动值的差值变化
       * 当这个差值小于标题栏的高度（30px）时,说明马上要切换到下一个歌手组区间了
       * @param newVal
       */
      diff(newVal) {
        // 固定标题栏移动的距离 向上滚动为负值 移动距离变化：newVal - TITLE_HEIGHT 30-30 -> 0-30
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        // 减少DOM操作，性能优化 ？？？
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        // 操作DOM向上移动，移动距离为 固定标题栏距离顶部距离（负值）
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      }
    },
    components: {
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"

  .listview
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
