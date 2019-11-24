<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <SearchBox
          @query="onQueryChange"
          placeholder="搜索歌曲"
          ref="searchBox"
        />
      </div>
      <div class="shortcut" v-show="!query">
        <Switches
          :currentIndex="currentIndex"
          :switches="switches"
          @switch="switchItem"
        />
        <div class="list-wrapper">
          <Scroll
            class="list-scroll"
            v-if="currentIndex === 0"
            :data="playHistory"
            ref="songList"
          >
            <div class="list-inner">
              <SongList :songs="playHistory" @select="selectSong" />
            </div>
          </Scroll>
          <Scroll
            class="list-scroll"
            v-if="currentIndex === 1"
            :refreshDelay="refreshDelay"
            :data="searchHistory"
            ref="searchList"
          >
            <div class="list-inner">
              <SearchList
                @delete="deleteSearchHistory"
                @select="addQuery"
                :searches="searchHistory"
              />
            </div>
          </Scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <Suggest
          :query="query"
          :showSinger="showSinger"
          @select="selectSuggest"
          @listScroll="blurInput"
        />
      </div>
      <TopTip ref="topTip" :delay="delay">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </TopTip>
    </div>
  </transition>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import Suggest from '@/components/Suggest'
import Switches from '@/components/Switches'
import Scroll from '@/components/Scroll'
import SearchList from '@/components/SearchList'
import SongList from '@/components/SongList'
import TopTip from '@/components/TopTip'
import SearchBox from '@/components/SearchBox'
import { SearchMixin } from '@/utils/mixin'
import Song from '@/utils/song'
import { ISwitch } from '../../types'

@Component({
  components: {
    Suggest,
    Switches,
    Scroll,
    SearchList,
    SongList,
    TopTip,
    SearchBox
  }
})
export default class AddSong extends Mixins(SearchMixin) {
  @Getter public playHistory!: Song[]
  @Action public insertSong!: (song: Song) => void

  public showFlag: boolean = false
  public showSinger: boolean = false
  public currentIndex: number = 0
  public switches: ISwitch[] = [{ name: '最近播放' }, { name: '搜索历史' }]
  public delay: number = 2000
  public $refs!: {
    songList: Scroll
    searchList: Scroll
    topTip: TopTip
    searchBox: SearchBox
  }

  public show() {
    this.showFlag = true
    setTimeout(() => {
      this.currentIndex === 0
        ? this.$refs.songList.refresh()
        : this.$refs.searchList.refresh()
    }, 20)
  }

  public hide() {
    this.showFlag = false
  }

  public selectSuggest() {
    this.saveSearch()
    this.showTip()
  }

  public switchItem(index: number) {
    this.currentIndex = index
  }

  public selectSong(song: Song, index: number) {
    if (index !== 0) {
      this.insertSong(new Song(song))
    }
    this.showTip()
  }

  private showTip() {
    this.$refs.topTip.show()
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;

  &.slide-enter-active,
  &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter,
  &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

  .header {
    position: relative;
    height: 44px;
    text-align: center;

    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }

    .close {
      position: absolute;
      top: 0;
      right: 8px;

      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }

  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
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
  }

  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }

  .tip-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;

    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }

    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
</style>
