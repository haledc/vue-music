<template>
  <div class="player" v-show="playlist.length > 0">
    <!--全屏播放器-->
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
        <!--播放器头部-->
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <!--播放器中间部分-->
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <!--播放器中间左边-CD页面-->
          <div class="middle-l" ref="middleL">
            <!--cd图片-->
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
            <!--当前歌词-->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>
          <!--播放器中间右边-歌词页面 滚动组件 -->
          <Scroll
            class="middle-r"
            ref="lyricList"
            :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  :class="{ current: currentLineNum === index }"
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                >
                  {{ line.txt }}
                </p>
              </div>
              <div class="pure-music" v-show="isPureMusic">
                <p>{{ pureMusicLyric }}</p>
              </div>
            </div>
          </Scroll>
        </div>
        <!--播放器底部-->
        <div class="bottom">
          <!--滑动点阵-->
          <div class="dot-wrapper">
            <span class="dot" :class="{ active: currentShow === 'cd' }"></span>
            <span
              class="dot"
              :class="{ active: currentShow === 'lyric' }"
            ></span>
          </div>
          <!--播放器进度条-->
          <div class="progress-wrapper">
            <!--当前播放时间-->
            <span class="time time-l">{{ format(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <!--进度条组件-->
              <ProgressBar
                ref="progressBar"
                :percent="percent"
                @percentChange="onProgressBarChange"
                @percentChanging="onProgressBarChanging"
              />
            </div>
            <!--歌曲总时长-->
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <!--播放器控制面板-->
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
    <!--迷你播放器-->
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
    <!--播放列表组件-->
    <Playlist ref="playlist" />
    <!--多媒体标签播放音乐-->
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
import { mapGetters, mapMutations, mapActions } from 'vuex'
import animations from 'create-keyframe-animation' // 动画第三方库，方便js编程
import Lyric from 'lyric-parser' // 歌词解析库，方便歌词操作

import ProgressBar from '@/components/ProgressBar'
import ProgressCircle from '@/components/ProgressCircle'
import Scroll from '@/components/Scroll'
import Playlist from '@/components/Playlist'

import { playMode } from '@/assets/helpers/config'
import { prefixStyle } from '@/assets/helpers/dom'
import { playerMixin } from '@/assets/helpers/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

const timeExp = /\[(\d{2}):(\d{2}):(\d{2})]/g

export default {
  mixins: [playerMixin],
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  data() {
    return {
      songReady: false, // 歌曲是否准备好
      currentTime: 0, // 当前播放时间
      radius: 32, // circle半径
      currentLyric: null, // 当前歌曲的歌词
      currentLineNum: 0, // 当前歌词索引
      currentShow: 'cd', // 当前展示页面
      playingLyric: '', // 当前播放的歌词(一行歌词)
      isPureMusic: false,
      pureMusicLyric: ''
    }
  },
  computed: {
    // CD 图片旋转暂停样式切换
    cdCls() {
      return this.playing ? 'play' : ''
    },

    // 全屏界面播放暂停图标样式切换
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },

    // 迷你界面播放暂停图标样式切换
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },

    // 无效图标切换，只改了颜色(颜色变暗)
    disableCls() {
      return this.songReady ? '' : 'disable'
    },

    // 进度条百分比 (当前歌曲播放时间 / 歌曲总时长)
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters(['fullScreen', 'playing', 'currentIndex'])
  },
  created() {
    // 创建一个 touch 对象，用来作为中间量在几个 touch 事件中共享数据
    // 服务于播放器中间部分 CD 页面和歌词页面切换的 touch 事件
    this.touch = {}
  },
  watch: {
    // 监听当前歌曲变化
    currentSong(newSong, oldSong) {
      // 如果当前的歌曲和更新的歌曲是同一首歌，或者不存在（歌曲被全部删除掉了），则不执行下面逻辑
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return
      }
      // 先把songReady状态设置为false， 播放之后在设为true，才能切换歌曲
      this.songReady = false
      this.canLyricPlay = false
      // 如果歌曲变化时，还有当前歌词，需要把它停掉，然后重置全部的当前状态
      if (this.currentLyric) {
        this.currentLyric.stop()
        this.currentLyric = null
        this.currentTime = 0
        this.playingLyric = ''
        this.currentLineNum = 0
      }
      this.$refs.audio.src = newSong.url
      this.$refs.audio.play()
      // 若歌曲 5s 未播放， 则认为超时， 修改状态确保可以切换歌曲
      clearTimeout(this.timer)
      // 歌曲变化后，定时 5 秒，把 songReady 状态设置为 true
      this.timer = setTimeout(() => {
        this.songReady = true
      }, 5000)
      this.getLyric()
    },

    // 监听歌曲播放状态
    playing(newPlaying) {
      if (!this.songReady) {
        return
      }
      const audio = this.$refs.audio

      // newPlaying 为 true 播放歌曲，为 false 暂停播放
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
    },

    fullScreen(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.$refs.lyricList.refresh()
          this.$refs.progressBar.setProgressOffset(this.percent)
        }, 20)
      }
    }
  },
  methods: {
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },

    // 全屏播放器-动画-进入
    enter(el, done) {
      // 获取实际偏移量X，Y，比例scale
      const { x, y, scale } = this._getPosAndScale()
      // 动画过程步骤 相当于原生的keyframes
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
      // 使用第三方库，注册动画
      animations.registerAnimation({
        name: 'move', // 名字
        animation, // 关键帧
        // 预设
        presets: {
          duration: 400, // 持续时间
          easing: 'linear' // 过渡类型
        }
      })
      // 使用第三方库，运行动画，并传入回调函数 done，跳转到 afterEnter
      // animations.runAnimation (dom, name, cb)
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },

    // 全屏播放器-动画-进入之后
    afterEnter() {
      // 注销动画
      animations.unregisterAnimation('move')
      // 动画设置为空
      this.$refs.cdWrapper.style.animation = ''
    },

    // 全屏播放器-动画-离开
    leave(el, done) {
      // 过渡时间
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosAndScale()
      // 移动图片
      this.$refs.cdWrapper.style[
        transform
      ] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      const timer = setTimeout(done, 4000)
      // 监听过渡完成事件，清除定时器，并调用函数done，跳转到afterLeave
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
        clearTimeout(timer)
        done()
      })
    },

    // 全屏播放器-动画-离开之后
    // 过渡和转换设置为空
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },

    // 歌曲播放暂停切换方法
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      // 歌词也要调用第三方库的切换方法
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },

    // 监听监听 audio 的 ended 事件方法
    // 重置播放时间为 0，如果是循环模式则进入调用循环播放方法，否则，播放下一首
    end() {
      this.currentTime = 0
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },

    // 循环播放方法
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      this.setPlayingState(true)
      // 如果还有歌词，需要把歌词的当前行重置到第一行
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },

    // 播放下一首歌曲
    next() {
      // 如果歌曲没准备好时，点击无效（针对快速连点报错）
      if (!this.songReady) {
        return
      }
      // 如果列表只有一首歌，设置单曲循环, 否则索引+1，如果上一首歌是是最后一首歌则跳转到第一首歌
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        // 当最后一首歌 (length - 1) 要跳转时
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        // 如果歌曲不播放时，就使它播放
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    },

    // 播放上一首歌曲
    prev() {
      // 如果歌曲没准备好时，点击无效（针对快速连点报错）
      if (!this.songReady) {
        return
      }
      // 如果列表只有一首歌，设置单曲循环，否则索引-1，如果是上一首歌是第一首歌则跳转到最后一首歌
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        // 当第一首歌要跳转时
        if (index === -1) {
          index = this.currentIndex.length - 1
        }
        this.setCurrentIndex(index)
        // 如果歌曲不播放时，就使它播放
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    },

    // 监听 audio 的 playing 事件
    ready() {
      clearTimeout(this.timer)
      // 监听 playing 这个事件可以确保慢网速或者快网速切换歌曲导致的 DOM Exception
      this.songReady = true
      this.canLyricPlay = true
      // 保存到播放历史
      this.savePlayHistory(this.currentSong)
      // 如果歌曲的播放晚于歌词的出现， 播放的时候需要同步歌词
      if (this.currentLyric && !this.isPureMusic) {
        this.currentLyric.seek(this.currentTime * 1000)
      }
    },

    // 监听 audio 的 pause 事件，设置播放状态为 false,并且停止歌词
    paused() {
      this.setPlayingState(false)
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
    },

    // 监听audio的error事件
    error() {
      clearTimeout(this.timer)
      this.songReady = true
    },

    // 监听 audio 的 timeupdate 事件，获取实时播放时间
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },

    // 格式化时间戳
    format(interval) {
      interval = interval | 0
      // 获得分钟数
      const minute = (interval / 60) | 0
      // 获得秒数，1位的秒数需要在前面补0  0.1 => 0.01
      const second = this._pad(interval % 60)
      // 返回固定时间格式
      return `${minute}:${second}`
    },

    // 监听进度条子组件派发的 touchMove 事件
    // 根据进度条的偏移量来调整当前歌曲播放时间
    onProgressBarChanging(percent) {
      this.currentTime = this.currentSong.duration * percent
      if (this.currentLyric) {
        this.currentLyric.seek(this.currentTime * 1000)
      }
    },

    // 监听进度条子组件派发的进度条 touchEnd 和 click 事件
    // 根据进度条的偏移量来调整当前歌曲播放时间和歌词显示
    onProgressBarChange(percent) {
      const currentTime = this.currentSong.duration * percent
      this.currentTime = this.$refs.audio.currentTime = currentTime
      // 歌词也重置到进度条所在位置的时间
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
      if (!this.playing) {
        this.togglePlaying()
      }
    },

    // 获取歌词
    getLyric() {
      // 直接调用类的实例的方法获取歌词
      this.currentSong
        .getLyric()
        .then(lyric => {
          // 如果歌词和当前歌曲的歌词不匹配则返回，适用于快速切换歌曲，歌词匹配错误
          if (this.currentSong.lyric !== lyric) {
            return
          }
          // 第三方库解析歌词
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          this.isPureMusic = !this.currentLyric.lines.length
          if (this.isPureMusic) {
            this.pureMusicLyric = this.currentLyric.lrc
              .replace(timeExp, '')
              .trim()
            this.playingLyric = this.pureMusicLyric
          } else {
            if (this.playing && this.canLyricPlay) {
              // 这个时候有可能用户已经播放了歌曲， 要切到对应位置
              this.currentLyric.seek(this.currentTime * 1000)
            }
          }
        })
        .catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
    },

    // 操作歌词变化
    handleLyric({ lineNum, txt }) {
      if (!this.$refs.lyricLine) {
        return
      }
      // 设置高亮样式，当前歌词行 = 歌词索引
      this.currentLineNum = lineNum
      // 第5行之后开始滚动
      if (lineNum > 5) {
        // 拿到第五行后的歌词DOM
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        // 滚动到歌词DOM
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        // 前五行滚动到顶部
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      // 当前的播放歌词就是txt
      this.playingLyric = txt
    },

    showPlaylist() {
      this.$refs.playlist.show()
    },

    // 监听中间部分 touchStart 事件，记录初始值
    middleTouchStart(e) {
      this.touch.initiated = true
      // 用来判断是否是一次移动
      this.touch.moved = false
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },

    // 监听中间部分 touchMove 事件，操作 CD 页面和歌词页面的实时滑动
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      // X轴偏移差值
      const deltaX = touch.pageX - this.touch.startX
      // Y轴偏移差值
      const deltaY = touch.pageY - this.touch.startY
      // 如果Y轴偏移更多的话，认为是在Y轴滚动了歌词，不进行操作【dom的touch事件是在X轴滑动的】【注意针对滑动屏幕的时候手势可能会偏】
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      if (!this.touch.moved) {
        this.touch.moved = true
      }
      // 定义一个左偏距 当页面为左边的 CD 页面时为 0， 为歌词页面时为屏幕宽度（负值）【从右滑动到左为负值】
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      // 滑动偏移量范围【特指歌词页面的滑动偏移】 最大为0，最小为-375px（向左滑动）
      const offsetWidth = Math.min(
        0,
        Math.max(-window.innerWidth, left + deltaX)
      )
      // 滑动百分比 = 滑动偏移量 / 屏幕宽度
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      // move过程中的滑动操作
      this.$refs.lyricList.$el.style[
        transform
      ] = `translate3d(${offsetWidth}px, 0, 0)`
      // move过程中的滑动的过渡时间
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      // move过程中滑动的透明度变化
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      // move过程中滑动的透明度的过渡时间
      this.$refs.middleL.style[transitionDuration] = 0
    },

    // 监听中间部分 touchEnd 事件，操作 CD 页面和歌词页面的最终滑动状态
    middleTouchEnd() {
      if (!this.touch.moved) {
        return
      }
      let offsetWidth
      let opacity
      // 当在cd页面时
      if (this.currentShow === 'cd') {
        // 滑动的偏移量大于10%时，向右滑动页面宽度一样的距离，透明度变为0
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
          // 偏移量不到10%时偏移量重置为0，滑动为0，透明度不变
        } else {
          offsetWidth = 0
          opacity = 1
        }
        // 当在歌词页面时
      } else {
        // 滑动的偏移量大于 10% 时就可以成功滑到左边
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      // 歌词页面滑动操作
      this.$refs.lyricList.$el.style[
        transform
      ] = `translate3d(${offsetWidth}px,0,0)`
      // 歌词页面滑动的过渡时间
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      // CD 页面透明度操作
      this.$refs.middleL.style.opacity = opacity
      // CD 页面透明度的过渡时间
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
      // 重置初始化值为 false
      this.touch.initiated = false
    },

    // 1位秒数前面补0
    _pad(num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },

    // 获取全屏播放器 CD 图片和迷你播放器 CD 图片的距离差值和比例
    _getPosAndScale() {
      // 小圆图标尺寸 宽=高
      const targetWidth = 100
      // 小圆距左边距离
      const paddingLeft = 40
      // 小圆距底部距离
      const paddingBottom = 30
      // 大圆距离顶部距离
      const paddingTop = 80
      // 大圆图标尺寸 宽=高
      const width = window.innerWidth * 0.8
      // 比例 小圆宽度/大圆宽度
      const scale = targetWidth / width
      // X轴移动距离  【屏幕宽度的一半 - 小圆距离左边的距离】 从右移动到左 为负值
      const x = -(window.innerWidth / 2 - paddingLeft)
      // Y轴移动距离  【屏幕高度的一般 - 大圆距离顶部距离 - 再减去大圆宽度的一半 - 小圆距底部距离】 从上移动到下 为正值
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },

    // 计算内层 Image 的 transform， 并同步到外层容器
    syncWrapperTransform(wrapper, inner) {
      if (!this.$refs[wrapper]) {
        return
      }
      let imageWrapper = this.$refs[wrapper]
      let image = this.$refs[inner]
      let wTransform = getComputedStyle(imageWrapper)[transform]
      let iTransform = getComputedStyle(image)[transform]
      imageWrapper.style[transform] =
        wTransform === 'none' ? iTransform : iTransform.concat(' ', wTransform)
    },

    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    }),

    ...mapActions(['savePlayHistory'])
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
