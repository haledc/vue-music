<template>
  <div
    class="rank"
    ref="rank"
  >
    <Scroll
      class="top-list"
      ref="topList"
      :data="topList"
    >
      <ul>
        <li
          v-for="item in topList"
          :key="item.id"
          class="item"
        >
          <div class="icon">
            <img
              v-lazy="item.picUrl"
              alt="picUrl"
              width="100"
              height="100"
            >
          </div>
          <ul class="song-list">
            <li
              class="song"
              v-for="(song, index) in item.songList"
              :key="index"
            >
              <span>
                {{ index + 1 }}
              </span>
              <span>
                {{ song.songname }}-{{ song.singername }}
              </span>
            </li>
          </ul>
        </li>
      </ul>
      <div
        class="loading-container"
        v-show="!topList.length"
      >
        <Loading />
      </div>
    </Scroll>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { getTopList } from '@/assets/api/rank'
import { ERR_OK } from '@/assets/api/config'
import Scroll from '@/components/Scroll.vue'
import Loading from '@/components/Loading.vue'
import { Mutation } from 'vuex-class'
import * as types from '@/store/mutation-types'
import { PlaylistMixin } from '@/assets/utils/mixin'

@Component({
  components: {
    Scroll,
    Loading
  }
})
export default class Rank extends PlaylistMixin {
  @Mutation(types.SET_TOP_LIST)
  public setTopList: any

  public topList: any[] = []
  public $refs: any

  public created() {
    this.getTopList()
  }

  public handlePlaylist(playlist: any) {
    const bottom = playlist.length > 0 ? '60px' : ''
    this.$refs.rank.style.bottom = bottom
    this.$refs.topList.refresh()
  }

  public selectItem(item: any) {
    this.$router.push(`/rank/${item.id}`)
    this.setTopList(item)
  }

  private getTopList() {
    getTopList().then((res: any) => {
      if (res.code === ERR_OK) {
        this.topList = res.data.topList
      }
    })
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'
@import '~@/assets/styles/mixin.styl'

.rank
  position: fixed
  width: 100%
  top: 88px
  bottom: 0

  .top-list
    height: 100%
    overflow: hidden

    .item
      display: flex
      margin: 0 20px
      padding-top: 20px
      height: 100px

      &:last-child
        padding-bottom: 20px

      .icon
        flex: 0 0 100px
        width: 100px
        height: 100px

      .song-list
        flex: 1
        display: flex
        flex-direction: column
        justify-content: center
        padding: 0 20px
        height: 100px
        overflow: hidden
        background: $color-highlight-background
        color: $color-text-d
        font-size: $font-size-small

        .song
          no-wrap()
          line-height: 26px

    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
