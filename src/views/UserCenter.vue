<template>
  <transition name="slide">
    <div class="user-center">
      <!-- 后退 -->
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <!-- 导航开关 -->
      <div class="switches-wrapper">
        <Switches
          :currentIndex="currentIndex"
          :switches="switches"
          @switch="switchItem"
        />
      </div>
      <!-- 随机播放全部 -->
      <div class="play-btn" ref="playBtnRef" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapperRef">
        <!-- 我喜欢的 -->
        <Scroll
          class="list-scroll"
          v-if="currentIndex === 0"
          :data="favoriteList"
          ref="favoriteListRef"
        >
          <div class="list-inner">
            <SongList :songs="favoriteList" @select="selectSong" />
          </div>
        </Scroll>
        <!-- 最近听的 -->
        <Scroll
          class="list-scroll"
          v-if="currentIndex === 1"
          :data="playHistory"
          ref="playListRef"
        >
          <div class="list-inner">
            <SongList :songs="playHistory" @select="selectSong" />
          </div>
        </Scroll>
      </div>
      <!-- 没有内容 -->
      <div class="no-result-wrapper" v-show="noResult">
        <NoResult :title="noResultDesc" />
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import Switches from '@/components/Switches'
import NoResult from '@/components/NoResult'
import Scroll from '@/components/Scroll'
import SongList from '@/components/SongList'
import { usePlaylist, useActions } from '@/hooks'

export default {
  components: {
    Switches,
    Scroll,
    SongList,
    NoResult
  },
  setup(props, { root, refs }) {
    const insertSong = useActions(root, 'insertSong')
    const randomPlay = useActions(root, 'randomPlay')

    const currentIndex = ref(0)

    const favoriteList = computed(() => root.$store.getters.favoriteList)
    const playHistory = computed(() => root.$store.getters.playHistory)
    const noResult = computed(() =>
      currentIndex.value === 0
        ? !favoriteList.value.length
        : !playHistory.value.length
    )
    const noResultDesc = computed(() =>
      currentIndex.value === 0 ? '暂无收藏歌曲' : '你还没有听过歌曲'
    )

    function handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      refs.listWrapperRef.style.bottom = bottom
      refs.favoriteListRef && refs.favoriteListRef.refresh()
      refs.playlistRef && refs.playlistRef.refresh()
    }

    usePlaylist(root, handlePlaylist)

    function switchItem(index) {
      currentIndex.value = index
    }

    function selectSong(song) {
      insertSong(song)
    }

    function back() {
      root.$router.back()
    }

    function random() {
      let list =
        currentIndex.value === 0 ? favoriteList.value : playHistory.value
      if (list.length === 0) return
      randomPlay({ list })
    }

    return {
      currentIndex,
      switches: [{ name: '我喜欢的' }, { name: '最近听的' }],
      noResult,
      noResultDesc,
      back,
      switchItem,
      random,
      favoriteList,
      selectSong,
      playHistory
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

.user-center {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
  background: $color-background;

  &.slide-enter-active,
  &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter,
  &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

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

  .switches-wrapper {
    margin: 10px 0 30px 0;
  }

  .play-btn {
    box-sizing: border-box;
    width: 135px;
    padding: 7px 0;
    margin: 0 auto;
    text-align: center;
    border: 1px solid $color-text-l;
    color: $color-text-l;
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

  .list-wrapper {
    position: absolute;
    top: 110px;
    bottom: 0;
    width: 100%;

    .list-scroll {
      height: 100%;
      overflow: hidden;

      .list-inner {
        padding: 20px 30px;
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
