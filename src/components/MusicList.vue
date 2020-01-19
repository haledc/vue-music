<template>
  <div class="music-list">
    <!-- 后退按钮 -->
    <div class="back" @click="back">
      <i class="icon-back" />
    </div>
    <!-- 标题-歌手名字 -->
    <h1 class="title" v-html="title"></h1>
    <!-- 背景-歌手图片 -->
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
      <!-- 作高斯模糊图层 -->
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 背景覆盖层 可以移动遮住图片 -->
    <div class="bg-layer" ref="layer"></div>
    <!-- 滚动组件 -->
    <Scroll
      @scroll="scroll"
      :probe-type="probeType"
      :listen-scroll="listenScroll"
      :data="songs"
      class="list"
      ref="list"
    >
      <div class="song-list-wrapper">
        <!-- 歌曲列表组件 -->
        <SongList :rank="rank" @select="selectItem" :songs="songs" />
      </div>
      <!-- 加载图标 -->
      <div class="loading-container" v-show="!songs.length">
        <Loading />
      </div>
    </Scroll>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from '@vue/composition-api'
import Scroll from '@/components/Scroll'
import SongList from '@/components/SongList'
import Loading from '@/components/Loading'
import { prefixStyle } from '@/utils/dom'
import { usePlaylist, useActions } from '@/hooks'

// 顶部预留 40px（标题高度）常量不被滚动
const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')

export default {
  components: {
    Scroll,
    SongList,
    Loading
  },
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { root, refs }) {
    const selectPlay = useActions(root, 'selectPlay')
    const randomPlay = useActions(root, 'randomPlay')

    const probeType = 3
    const listenScroll = true
    let imageHeight, minTranslateY

    const scrollY = ref(0)

    const bgStyle = computed(() => `background-image:url(${props.bgImage})`)

    onMounted(() => {
      imageHeight = refs.bgImage.clientHeight
      minTranslateY = -imageHeight + RESERVED_HEIGHT
      refs.list.$el.style.top = `${imageHeight}px`
    })

    usePlaylist(root, handlePlaylist)

    watch(
      () => scrollY.value,
      newY => {
        const translateY = Math.max(minTranslateY, newY)
        let zIndex = 0
        let scale = 1
        let blur = 0
        const percent = Math.abs(newY / imageHeight)
        // newY > 0 向下滚动
        if (newY > 0) {
          scale = 1 + percent
          zIndex = 10
        } else {
          blur = Math.min(20, percent * 20) // 模糊效果最大为20
        }
        // layer层跟着一起往上滚动
        refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
        // 高斯模糊效果
        refs.filter.style[backdrop] = `blur(${blur}px)`
        // 当滚动的新值比最远的滚动距离小时，即滚动到顶部
        if (newY < minTranslateY) {
          zIndex = 10
          refs.bgImage.style.paddingTop = 0
          refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          refs.playBtn.style.display = 'none'
          // 当滚动的新值比最远的滚动距离大时，即还没有滚到顶部
          // 需要重置图片的高度，不然下拉的时候会把最上面80px的背景图片遮住
        } else {
          refs.bgImage.style.paddingTop = '70%'
          refs.bgImage.style.height = 0
          refs.playBtn.style.display = ''
        }
        refs.bgImage.style[transform] = `scale(${scale})`
        refs.bgImage.style.zIndex = zIndex
      },
      {
        lazy: true
      }
    )

    function handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      refs.list.$el.style.bottom = bottom
      refs.list.refresh()
    }

    function scroll(pos) {
      scrollY.value = pos.y
    }

    function back() {
      root.$router.back()
    }

    function selectItem(item, index) {
      selectPlay({
        list: props.songs,
        index
      })
    }

    function random() {
      randomPlay({
        list: props.songs
      })
    }

    return {
      probeType,
      listenScroll,
      back,
      bgStyle,
      random,
      scroll,
      selectItem
    }
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
