<template>
  <div class="player" v-show="playlist.length > 0">
    <!-- 全屏播放器 -->
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <!-- 播放器头部 -->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!-- 播放器中间部分 -->
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <!-- 播放器中间左边-CD页面 -->
          <div class="middle-l" ref="middleL">
            <!-- cd图片 -->
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="imageWrapper">
                <img
                  class="image"
                  :class="cdCls"
                  :src="currentSong.image"
                  ref="image"
                />
              </div>
            </div>
            <!-- 当前歌词 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ state.playingLyric }}</div>
            </div>
          </div>
          <!-- 播放器中间右边-歌词页面 滚动组件  -->
          <Scroll
            class="middle-r"
            ref="lyricListRef"
            :data="state.currentLyric && state.currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="state.currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  :class="{ current: state.currentLineNum === index }"
                  v-for="(line, index) in state.currentLyric.lines"
                  :key="index"
                >
                  {{ line.txt }}
                </p>
              </div>
              <div class="pure-music" v-show="state.isPureMusic">
                <p>{{ state.pureMusicLyric }}</p>
              </div>
            </div>
          </Scroll>
        </div>
        <!-- 播放器底部 -->
        <div class="bottom">
          <!-- 滑动点阵 -->
          <div class="dot-wrapper">
            <span
              class="dot"
              :class="{ active: state.currentShow === 'cd' }"
            ></span>
            <span
              class="dot"
              :class="{ active: state.currentShow === 'lyric' }"
            ></span>
          </div>
          <!-- 播放器进度条 -->
          <div class="progress-wrapper">
            <!-- 当前播放时间 -->
            <span class="time time-l">{{ format(state.currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <!-- 进度条组件 -->
              <ProgressBar
                ref="progressBar"
                :percent="percent"
                @percentChange="onProgressBarChange"
                @percentChanging="onProgressBarChanging"
              />
            </div>
            <!-- 歌曲总时长 -->
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <!-- 播放器控制面板 -->
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i
                class="needsclick"
                @click="togglePlaying"
                :class="playIcon"
              ></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i
                class="icon"
                :class="favoriteIcon"
                @click="toggleFavorite(currentSong)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 迷你播放器 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper" ref="miniWrapper">
            <img
              ref="miniImage"
              :class="cdCls"
              width="40"
              height="40"
              :src="currentSong.image"
            />
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <ProgressCircle :radius="radius" :percent="percent">
            <i
              @click.stop="togglePlaying"
              class="icon-mini"
              :class="miniIcon"
            ></i>
          </ProgressCircle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <!-- 播放列表组件 -->
    <Playlist ref="playlistRef" />
    <!-- 多媒体标签播放音乐 -->
    <audio
      ref="audio"
      @playing="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
      @pause="paused"
    ></audio>
  </div>
</template>

<script>
import { reactive, computed, watch } from '@vue/composition-api'
import animations from 'create-keyframe-animation' // 动画第三方库，方便js编程
import Lyric from 'lyric-parser' // 歌词解析库，方便歌词操作
import ProgressBar from '@/components/ProgressBar'
import ProgressCircle from '@/components/ProgressCircle'
import Scroll from '@/components/Scroll'
import Playlist from '@/components/Playlist'
import { playMode } from '@/utils/config'
import { prefixStyle } from '@/utils/dom'
import { usePlayer, useMutations, useActions } from '@/hooks'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

const timeExp = /\[(\d{2}):(\d{2}):(\d{2})]/g

export default {
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  setup(props, { root, refs }) {
    const setFullScreen = useMutations(root, 'SET_FULL_SCREEN')
    const savePlayHistory = useActions(root, 'savePlayHistory')

    const state = reactive({
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: '',
      isPureMusic: false,
      pureMusicLyric: '',
      canLyricPlay: false
    })
    let touch = {},
      timer,
      lyricList

    const {
      mode,
      playlist,
      currentSong,
      setCurrentIndex,
      setPlayingState,
      iconMode,
      favoriteIcon,
      changeMode,
      toggleFavorite
    } = usePlayer(root)

    const fullScreen = computed(() => root.$store.getters.fullScreen)
    const playing = computed(() => root.$store.getters.playing)
    const currentIndex = computed(() => root.$store.getters.currentIndex)
    const cdCls = computed(() => (playing.value ? 'play' : ''))
    const playIcon = computed(() =>
      playing.value ? 'icon-pause' : 'icon-play'
    )
    const miniIcon = computed(() =>
      playing.value ? 'icon-pause-mini' : 'icon-play-mini'
    )
    const disableCls = computed(() => (state.songReady ? '' : 'disable'))
    const percent = computed(
      () => state.currentTime / currentSong.value.duration
    )

    watch(
      () => currentSong.value,
      (newSong, oldSong) => {
        if (!newSong.id || !newSong.url || newSong.id === oldSong.id) return
        state.songReady = false
        state.canLyricPlay = false
        if (state.currentLyric) {
          state.currentLyric.stop()
          state.currentLyric = null
          state.currentTime = 0
          state.playingLyric = ''
          state.currentLineNum = 0
        }
        refs.audio.src = newSong.url
        refs.audio.play()
        clearTimeout(timer)
        // 歌曲变化后，定时 5 秒，把 songReady 状态设置为 true
        timer = setTimeout(() => {
          state.songReady = true
        }, 5000)
        getLyric()
      }
    )

    watch(
      () => playing.value,
      newVal => {
        if (!state.songReady) return
        const audio = refs.audio
        root.$nextTick(() => {
          newVal ? audio.play() : audio.pause()
        })
        if (!newVal) {
          if (fullScreen.value) {
            syncWrapperTransform('imageWrapper', 'image')
          } else {
            syncWrapperTransform('miniWrapper', 'miniImage')
          }
        }
      }
    )

    watch(
      () => fullScreen.value,
      newVal => {
        if (newVal) {
          setTimeout(() => {
            lyricList.refresh()
            progressBar.setProgressOffset(percent.value)
          }, 20)
        }
      }
    )

    function back() {
      setFullScreen(false)
    }

    function open() {
      setFullScreen(true)
    }

    function enter(el, done) {
      const { x, y, scale } = _getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(refs.cdWrapper, 'move', done)
    }

    function afterEnter() {
      animations.unregisterAnimation('move')
      refs.cdWrapper.style.animation = ''
    }

    function leave(el, done) {
      refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = _getPosAndScale()
      refs.cdWrapper.style[
        transform
      ] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      const timer = setTimeout(done, 4000)
      refs.cdWrapper.addEventListener('transitionend', () => {
        clearTimeout(timer)
        done()
      })
    }

    function afterLeave() {
      refs.cdWrapper.style.transition = ''
      refs.cdWrapper.style[transform] = ''
    }

    function togglePlaying() {
      if (!state.songReady) return
      setPlayingState(!playing.value)
      if (state.currentLyric) {
        state.currentLyric.togglePlay()
      }
    }

    function end() {
      state.currentTime = 0
      if (mode.value === playMode.loop) {
        loop()
      } else {
        next()
      }
    }

    function loop() {
      refs.audio.currentTime = 0
      refs.audio.play()
      setPlayingState(true)
      if (state.currentLyric) {
        state.currentLyric.seek(0)
      }
    }

    function next() {
      if (!state.songReady) return
      if (playlist.value.length === 1) {
        loop()
      } else {
        let index = currentIndex.value + 1
        if (index === playlist.value.length) {
          index = 0
        }
        setCurrentIndex(index)
        if (!playing.value) {
          togglePlaying()
        }
      }
    }

    function prev() {
      if (!state.songReady) return
      if (playlist.value.length === 1) {
        loop()
      } else {
        let index = currentIndex.value - 1
        if (index === -1) {
          index = playlist.value.length - 1
        }
        setCurrentIndex(index)
        if (!playing.vaule) {
          togglePlaying()
        }
      }
    }

    function ready() {
      clearTimeout(timer)
      state.songReady = true
      state.canLyricPlay = true
      savePlayHistory(currentSong.value)
      if (state.currentLyric && !state.isPureMusic) {
        state.currentLyric.seek(state.currentTime * 1000)
      }
    }

    function paused() {
      setPlayingState(false)
      if (state.currentLyric) {
        state.currentLyric.stop()
      }
    }

    function error() {
      clearTimeout(timer)
      state.songReady = true
    }

    function updateTime(event) {
      state.currentTime = event.target.currentTime
    }

    function format(interval) {
      interval = interval | 0
      const minute = (interval / 60) | 0
      const second = _pad(interval % 60)
      return `${minute}:${second}`
    }

    function onProgressBarChanging(percent) {
      state.currentTime = currentSong.value.duration * percent
      if (state.currentLyric) {
        state.currentLyric.seek(state.currentTime * 1000)
      }
    }

    function onProgressBarChange(percent) {
      const currentTime = currentSong.value.duration * percent
      state.currentTime = refs.audio.currentTime = currentTime
      if (state.currentLyric) {
        state.currentLyric.seek(currentTime * 1000)
      }
      if (!playing.value) {
        togglePlaying()
      }
    }

    function getLyric() {
      currentSong.value
        .getLyric()
        .then(lyric => {
          if (currentSong.value.lyric !== lyric) return
          state.currentLyric = new Lyric(lyric, handleLyric)
          state.isPureMusic = !state.currentLyric.lines.length
          if (state.isPureMusic) {
            state.pureMusicLyric = state.currentLyric.lrc
              .replace(timeExp, '')
              .trim()
            state.playingLyric = state.pureMusicLyric
          } else {
            if (playing.value && state.canLyricPlay) {
              state.currentLyric.seek(state.currentTime * 1000)
            }
          }
        })
        .catch(() => {
          state.currentLyric = null
          state.playingLyric = ''
          state.currentLineNum = 0
        })
    }

    function handleLyric({ lineNum, txt }) {
      if (!refs.lyricLine) return
      state.currentLineNum = lineNum
      if (lineNum > 5) {
        let lineEl = refs.lyricLine[lineNum - 5]
        refs.lyricListRef.scrollToElement(lineEl, 1000)
      } else {
        refs.lyricListRef.scrollTo(0, 0, 1000)
      }
      state.playingLyric = txt
    }

    function showPlaylist() {
      refs.playlistRef.show()
    }

    function middleTouchStart(event) {
      touch.initiated = true
      touch.moved = false
      const touch = event.touches[0]
      touch.startX = touch.pageX
      touch.startY = touch.pageY
    }

    function middleTouchMove(event) {
      if (!touch.initiated) return
      const currentTouch = event.touches[0]
      const deltaX = currentTouch.pageX - touch.startX
      const deltaY = currentTouch.pageY - touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) return
      if (!touch.moved) touch.moved = true
      const left = state.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(
        0,
        Math.max(-window.innerWidth, left + deltaX)
      )
      touch.percent = Math.abs(offsetWidth / window.innerWidth)
      refs.lyricListRef.$el.style[
        transform
      ] = `translate3d(${offsetWidth}px, 0, 0)`
      refs.lyricListRef.$el.style[transitionDuration] = 0
      refs.middleL.style.opacity = 1 - touch.percent
      refs.middleL.style[transitionDuration] = 0
    }

    function middleTouchEnd() {
      if (!touch.moved) return
      let offsetWidth, opacity
      if (state.currentShow === 'cd') {
        if (touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          state.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        if (touch.percent < 0.9) {
          offsetWidth = 0
          state.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      refs.lyricListRef.$el.style[
        transform
      ] = `translate3d(${offsetWidth}px,0,0)`
      refs.lyricListRef.$el.style[transitionDuration] = `${time}ms`
      refs.middleL.style.opacity = opacity
      refs.middleL.style[transitionDuration] = `${time}ms`
      touch.initiated = false
    }

    function _pad(num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    }

    function _getPosAndScale() {
      // 小圆图片
      const targetWidth = 100
      const paddingLeft = 40
      const paddingBottom = 30
      // 大圆图片
      const paddingTop = 80
      const width = window.innerWidth * 0.8

      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    }

    function syncWrapperTransform(wrapper, inner) {
      if (!refs[wrapper]) return
      let imageWrapper = refs[wrapper]
      let image = refs[inner]
      let wTransform = getComputedStyle(imageWrapper)[transform]
      let iTransform = getComputedStyle(image)[transform]
      imageWrapper.style[transform] =
        wTransform === 'none' ? iTransform : iTransform.concat(' ', wTransform)
    }

    return {
      state,
      radius: 32,
      cdCls,
      iconMode,
      playIcon,
      miniIcon,
      fullScreen,
      favoriteIcon,
      disableCls,
      percent,
      fullScreen,
      currentSong,
      playlist,
      enter,
      disableCls,
      changeMode,
      afterEnter,
      leave,
      afterLeave,
      toggleFavorite,
      format,
      back,
      open,
      next,
      prev,
      middleTouchStart,
      middleTouchMove,
      middleTouchEnd,
      onProgressBarChange,
      onProgressBarChanging,
      togglePlaying,
      showPlaylist,
      ready,
      error,
      updateTime,
      end,
      paused
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap;
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }

            .play {
              animation: rotate 20s linear infinite;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }

          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
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

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0 auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active,
    &.normal-leave-active {
      transition: all 0.4s;

      .top,
      .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter,
    &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active,
    &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter,
    &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;

      .imgWrapper {
        height: 100%;
        width: 100%;

        img {
          border-radius: 50%;

          &.play {
            animation: rotate 10s linear infinite;
          }

          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        @include no-wrap;
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        @include no-wrap;
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini,
      .icon-pause-mini,
      .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
