<template>
  <div class="music-list">
    <!--后退按钮-->
    <div class="back" @click="back">
      <i class="icon-back" />
    </div>
    <!--标题-歌手名字-->
    <h1 class="title" v-html="title"></h1>
    <!--背景-歌手图片-->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div
          class="play"
          v-show="songs.length > 0"
          ref="playBtn"
          @click="random"
        >
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <!--作高斯模糊图层-->
      <div class="filter" ref="filter"></div>
    </div>
    <!--背景覆盖层 可以移动遮住图片-->
    <div class="bg-layer" ref="layer"></div>
    <!--滚动组件-->
    <Scroll
      @scroll="scroll"
      :probe-type="probeType"
      :listen-scroll="listenScroll"
      :data="songs"
      class="list"
      ref="list"
    >
      <div class="song-list-wrapper">
        <!--歌曲列表组件-->
        <SongList :rank="rank" @select="selectItem" :songs="songs" />
      </div>
      <!--加载图标-->
      <div class="loading-container" v-show="!songs.length">
        <Loading />
      </div>
    </Scroll>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import Scroll from '@/components/Scroll'
import SongList from '@/components/SongList'
import Loading from '@/components/Loading'

import { prefixStyle } from '@/utils/dom'
import { playlistMixin } from '@/utils/mixin'

// 顶部预留 40px（标题高度）常量不被滚动
const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')

export default {
  mixins: [playlistMixin],
  components: {
    Scroll,
    SongList,
    Loading
  },
  props: {
    // 背景图片
    bgImage: {
      type: String,
      default: ''
    },

    // 歌曲列表
    songs: {
      type: Array,
      default: () => []
    },

    // 歌曲列表名称
    title: {
      type: String,
      default: ''
    },

    // 是否排行
    rank: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollY: 0
    }
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  mounted() {
    // 背景图片高度
    this.imageHeight = this.$refs.bgImage.clientHeight

    // 最大滚动的距离（预留40px） 向上滚动为负值
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT

    // 设置歌曲列表的top值为背景图片的高度（设置组件的样式要加$el）
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  computed: {
    // 背景图片样式
    bgStyle() {
      return `background-image:url(${this.bgImage})`
    }
  },
  watch: {
    // 监听 scrollY 值，设置 bgLayer 滚动值 ★★★
    scrollY(newY) {
      // layer滚动值范围（newY~（-222px）） 最大值为this.minTranslateY即-222px
      let translateY = Math.max(this.minTranslateY, newY)
      // 默认图层
      let zIndex = 0
      // 默认放大比例
      let scale = 1
      // 默认模糊效果
      let blur = 0
      // 比例： 滚动新值/ 背景图片高度
      const percent = Math.abs(newY / this.imageHeight)
      // newY > 0 即【下拉，向下滚动】，图片比例放大
      if (newY > 0) {
        scale = 1 + percent
        // zIndex需比歌曲列表层大，图片才会有放大的效果
        zIndex = 10
        // 上拉，向上滚动，高斯模糊效果，苹果手机才能看到效果
      } else {
        // 模糊效果最大为20
        blur = Math.min(20, percent * 20)
      }
      // layer层跟着一起往上滚动
      this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
      // 高斯模糊效果
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`
      // 当滚动的新值比最远的滚动距离小时(this.minTranslateY = -222)，即【滚动到顶部】★
      if (newY < this.minTranslateY) {
        // 图片显示出来，遮住歌词列表
        zIndex = 10
        // 图片的paddingTop设置为0
        this.$refs.bgImage.style.paddingTop = 0
        // 图片的高度设置和标题的高度一样
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        // 设置随机播放按钮消失
        this.$refs.playBtn.style.display = 'none'
        // 当滚动的新值比最远的滚动距离大时，即【还没有滚到顶部】★
        // 需要重置图片的高度，不然下拉的时候会把最上面80px的背景图片遮住
      } else {
        // 样式重置，下同
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
        // 设置随机播放按钮出现
        this.$refs.playBtn.style.display = ''
      }
      // 图片比例变化，随着前面的scale变化而变化
      this.$refs.bgImage.style[transform] = `scale(${scale})`
      // 图片显示设置，随着前面的zIndex变化而变化
      this.$refs.bgImage.style.zIndex = zIndex
    }
  },
  methods: {
    // 列表新增 bottom=60px，使得 mini 播放器 (高度60px) 不会覆盖住播放列表底部
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },

    // 滚动方法
    scroll(pos) {
      this.scrollY = pos.y
    },

    // 返回
    back() {
      this.$router.back()
    },

    // 选中歌曲并播放
    selectItem(item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },

    // 随机播放
    random() {
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapActions(['selectPlay', 'randomPlay'])
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

.music-list {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;

  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;

    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }

  .title {
    position: absolute;
    top: 0;
    left: 10%;
    z-index: 40;
    width: 80%;
    @include no-wrap;
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }

  // 背景图片样式★★★
  .bg-image {
    position: relative;
    width: 100%;
    // 高度设置为0，方便在js中动态调整图片样式和其他样式
    height: 0;
    padding-top: 70%;
    transform-origin: top;
    background-size: cover;

    .play-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 50;
      width: 100%;

      .play {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;

        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }

        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
    }

    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }

  .bg-layer {
    position: relative;
    height: 100%;
    background: $color-background;
  }

  .list {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;

    .song-list-wrapper {
      padding: 20px 30px;
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
