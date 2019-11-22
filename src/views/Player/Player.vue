<template>
  <div class="player" v-show="playlist.length > 0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img
            :src="currentSong.image"
            alt="image"
            width="100%"
            height="100%"
          />
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" ref="imageWrapper">
                <img
                  :src="currentSong.image"
                  alt="image"
                  class="image"
                  :class="cdCls"
                  ref="image"
                />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">
                {{ playingLyric }}
              </div>
            </div>
          </div>
          <Scroll
            class="middle-r"
            ref="lyricList"
            :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                  ref="lyricLine"
                  class="text"
                  :class="{ current: currentLineNum === index }"
                >
                  {{ line.txt }}
                </p>
              </div>
              <div class="pure-music" v-show="isPureMusic">
                <p>
                  {{ pureMusicLyric }}
                </p>
              </div>
            </div>
          </Scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span
              class="dot"
              :class="{ active: currentShow === 'lyric' }"
            ></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">
              {{ format(currentTime) }}
            </span>
            <div class="progress-bar-wrapper">
              <ProgressBar
                ref="progressBar"
                :percent="percent"
                @percentChange="onProgressBarChange"
                @percentChanging="onProgressBarChanging"
              />
            </div>
            <span class="time time-r">
              {{ format(currentSong.duration) }}
            </span>
          </div>
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
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper" ref="miniWrapper">
            <img
              :src="currentSong.image"
              alt="image"
              ref="miniImage"
              :class="cdCls"
              width="40"
              height="40"
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
              class="icon-mini"
              :class="miniIcon"
              @click.stop="togglePlaying"
            ></i>
          </ProgressCircle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <Playlist ref="playlist"></Playlist>
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

<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import { Getter, Mutation, Action } from 'vuex-class'
import Lyric from 'lyric-parser'
import {
  registerAnimation,
  runAnimation,
  unregisterAnimation
} from 'create-keyframe-animation'
import ProgressBar from '@/components/ProgressBar'
import ProgressCircle from '@/components/ProgressCircle'
import * as types from '@/store/mutation-types'
import Scroll from '@/components/Scroll'
import Playlist from '@/components/Playlist'
import { prefixStyle } from '@/utils/dom'
import { playMode } from '@/utils/config'
import { PlayerMixin } from '@/utils/mixin'
import Song from '@/utils/song'

const transform: any = prefixStyle('transform')
const transitionDuration: any = prefixStyle('transitionDuration')
const timeExp = /\[(\d{2}):(\d{2}):(\d{2})\]/g

interface Touch {
  initiated: boolean
  moved: boolean
  startX: number
  startY: number
  percent: number
}

@Component({
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
})
export default class Player extends Mixins(PlayerMixin) {
  @Getter public fullScreen!: boolean
  @Getter public playing!: boolean
  @Getter public currentIndex!: number
  @Mutation(types.SET_FULL_SCREEN) public setFullScreen!: (
    falg: boolean
  ) => void
  @Action public savePlayHistory!: (song: Song) => void

  public songReady: boolean = false
  public currentTime: number = 0
  public radius: number = 32
  public currentLyric: Lyric | null = null
  public currentLineNum: number = 0
  public currentShow: string = 'cd'
  public playingLyric: string = ''
  public isPureMusic: boolean = false
  public pureMusicLyric: string = ''
  public touch = {} as Touch
  public $refs!: Vue['$refs'] & {
    audio: HTMLAudioElement
    cdWrapper: HTMLElement
    progressBar: ProgressBar
    playlist: Playlist
    lyricList: Scroll
    middleL: HTMLElement
    lyricLine: HTMLElement[]
  }
  public timer!: number
  public canLyricPlay!: boolean

  get cdCls() {
    return this.playing ? 'play' : ''
  }

  get playIcon() {
    return this.playing ? 'icon-pause' : 'icon-play'
  }

  get miniIcon() {
    return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
  }

  get disableCls() {
    return this.songReady ? '' : 'disable'
  }

  get percent() {
    return this.currentTime / this.currentSong.duration
  }

  public back() {
    this.setFullScreen(false)
  }

  public open() {
    this.setFullScreen(true)
  }

  @Watch('currentSong')
  public onCurrentSongChange(newSong: Song, oldSong: Song) {
    if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
      return
    }
    this.songReady = false
    this.canLyricPlay = false
    if (this.currentLyric) {
      this.currentLyric.stop()
      this.currentLyric = null
      this.currentTime = 0
      this.playingLyric = ''
      this.currentLineNum = 0
    }
    this.$refs.audio.src = newSong.url
    this.$refs.audio.play()
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.songReady = true
    }, 5000)
    this.getLyric()
  }

  @Watch('playing')
  public onPlayingChange(newPlaying: boolean) {
    if (!this.songReady) {
      return
    }
    const audio = this.$refs.audio
    this.$nextTick(() => {
      newPlaying ? audio.play() : audio.pause()
    })
    if (!newPlaying) {
      if (this.fullScreen) {
        this.syncWrapperTransform('imageWrapper', 'image')
      } else {
        this.syncWrapperTransform('miniWrapper', 'miniImage')
      }
    }
  }

  @Watch('fullScreen')
  public onFullScreenChange(newVal: boolean) {
    if (newVal) {
      setTimeout(() => {
        this.$refs.lyricList.refresh()
        this.$refs.progressBar.setProgressOffset(this.percent)
      }, 20)
    }
  }

  public enter(el: Element, done: () => void) {
    const { x, y, scale } = this.getPosAndScale()
    const animation = {
      0: { transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})` },
      60: { transform: `translate3d(0, 0, 0) scale(1.1)` },
      100: { transform: `translate3d(0, 0, 0) scale(1.0)` }
    }
    registerAnimation({
      name: 'move',
      animation,
      present: {
        duration: 400,
        easing: 'linear'
      }
    })
    runAnimation(this.$refs.cdWrapper, 'move', done)
  }

  public afterEnter() {
    unregisterAnimation('move')
    this.$refs.cdWrapper.style.animation = ''
  }

  public leave(el: Element, done: () => void) {
    this.$refs.cdWrapper.style.transition = 'all 0.4s'
    const { x, y, scale } = this.getPosAndScale()
    this.$refs.cdWrapper.style[
      transform
    ] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
    const timer = setTimeout(done, 4000)
    this.$refs.cdWrapper.addEventListener('transitionend', () => {
      clearTimeout(timer)
      done()
    })
  }

  public afterLeave() {
    this.$refs.cdWrapper.style.transition = ''
    this.$refs.cdWrapper.style[transform] = ''
  }

  public togglePlaying() {
    if (!this.songReady) {
      return
    }
    this.setPlayingState(!this.playing)
    if (this.currentLyric) {
      this.currentLyric.togglePlay()
    }
  }

  public end() {
    this.currentTime = 0
    this.mode === playMode.loop ? this.loop() : this.next()
  }

  public loop() {
    this.$refs.audio.currentTime = 0
    this.$refs.audio.play()
    this.setPlayingState(true)
    if (this.currentLyric) {
      this.currentLyric.seek(0)
    }
  }

  public next() {
    if (!this.songReady) {
      return
    }
    if (this.playlist.length === 1) {
      this.loop()
    } else {
      let index = this.currentIndex + 1
      if (index === this.playlist.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
    }
  }

  public prev() {
    if (!this.songReady) {
      return
    }
    if (this.playlist.length === 1) {
      this.loop()
    } else {
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playlist.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
    }
  }

  public ready() {
    clearTimeout(this.timer)
    this.songReady = true
    this.canLyricPlay = true
    this.savePlayHistory(this.currentSong)
    if (this.currentLyric && !this.isPureMusic) {
      this.currentLyric.seek(this.currentTime * 1000)
    }
  }

  public paused() {
    this.setPlayingState(false)
    if (this.currentLyric) {
      this.currentLyric.stop()
    }
  }

  public error() {
    clearTimeout(this.timer)
    this.songReady = true
  }

  public updateTime(e: Event) {
    this.currentTime = (e.target as HTMLAudioElement).currentTime
  }

  public onProgressBarChanging(percent: number) {
    this.currentTime = this.currentSong.duration * percent
    if (this.currentLyric) {
      this.currentLyric.seek(this.currentTime * 1000)
    }
  }

  public onProgressBarChange(percent: number) {
    const currentTime = this.currentSong.duration * percent
    this.currentTime = this.$refs.audio.currentTime = currentTime
    if (this.currentLyric) {
      this.currentLyric.seek(currentTime * 1000)
    }
    if (!this.playing) {
      this.togglePlaying()
    }
  }

  public getLyric() {
    this.currentSong
      .getLyric()
      .then(lyric => {
        if (this.currentSong.lyric !== lyric) {
          return
        }

        this.currentLyric = new Lyric(lyric, this.handleLyric)
        this.isPureMusic = !this.currentLyric.lines.length
        if (this.isPureMusic) {
          this.pureMusicLyric = this.currentLyric.lrc
            .replace(timeExp, '')
            .trim()
          this.playingLyric = this.pureMusicLyric
        } else {
          if (this.playing && this.canLyricPlay) {
            this.currentLyric.seek(this.currentTime * 1000)
          }
        }
      })
      .catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
  }

  public handleLyric({ lineNum, txt }: { lineNum: number; txt: string }) {
    if (!this.$refs.lyricLine) {
      return
    }
    this.currentLineNum = lineNum
    if (lineNum > 5) {
      const lineE1 = this.$refs.lyricLine[lineNum - 5]
      this.$refs.lyricList.scrollToElement(lineE1, 1000)
    } else {
      this.$refs.lyricList.scrollTo(0, 0, 1000)
    }
    this.playingLyric = txt
  }

  public showPlaylist() {
    this.$refs.playlist.show()
  }

  public middleTouchStart(e: TouchEvent) {
    this.touch.initiated = true
    this.touch.moved = false
    const touch = e.touches[0]
    this.touch.startX = touch.pageX
    this.touch.startY = touch.pageY
  }

  public middleTouchMove(e: TouchEvent) {
    if (!this.touch.initiated) {
      return
    }
    const touch = e.touches[0]
    const deltaX = touch.pageX - this.touch.startX
    const deltaY = touch.pageY - this.touch.startY
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return
    }
    if (!this.touch.moved) {
      this.touch.moved = true
    }
    const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
    const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
    this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
    const el = this.$refs.lyricList.$el as HTMLElement
    el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    el.style[transitionDuration] = '0'
    this.$refs.middleL.style.opacity = (1 - this.touch.percent).toString()
    this.$refs.middleL.style[transitionDuration] = '0'
  }

  public middleTouchEnd() {
    if (!this.touch.moved) {
      return
    }
    let offsetWidth
    let opacity
    if (this.currentShow === 'cd') {
      if (this.touch.percent > 0.1) {
        offsetWidth = -window.innerWidth
        opacity = 0
        this.currentShow = 'lyric'
      } else {
        offsetWidth = 0
        opacity = 1
      }
    } else {
      if (this.touch.percent < 0.9) {
        offsetWidth = 0
        this.currentShow = 'cd'
        opacity = 1
      } else {
        offsetWidth = -window.innerWidth
        opacity = 0
      }
    }
    const timer = 0
    const el = this.$refs.lyricList.$el as HTMLElement
    el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    el.style[transitionDuration] = `${timer}ms`
    this.$refs.middleL.style.opacity = opacity.toString()
    this.$refs.middleL.style[transitionDuration] = `${timer}ms`
    this.touch.initiated = false
  }

  private format(interval: number) {
    interval = Math.floor(interval)
    const minute = Math.floor(interval / 60)
    const second = this.pad((interval % 60).toString())
    return `${minute}:${second}`
  }

  private getPosAndScale() {
    const targetWidth = 100
    const paddingLeft = 40
    const paddingBottom = 30
    const paddingTop = 80
    const width = window.innerWidth * 0.8
    const scale = targetWidth / width
    const x = -(window.innerWidth / 2 - paddingLeft)
    const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
    return { x, y, scale }
  }

  private syncWrapperTransform(wrapper: string, inner: string) {
    if (!this.$refs[wrapper]) {
      return
    }
    const imageWrapper = this.$refs[wrapper] as HTMLElement
    const image = this.$refs[inner] as HTMLElement
    const wTransfrom = getComputedStyle(imageWrapper)[transform]
    const iTransfrom = getComputedStyle(image)[transform]
    imageWrapper.style[transform] =
      wTransfrom === 'none' ? iTransfrom : iTransfrom.concat(' ', wTransfrom)
  }

  private pad(num: string, n = 2) {
    let len = num.length
    while (len < n) {
      num = '0' + num
      len++
    }
    return num
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
@import '@/assets/styles/mixins.scss';

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
