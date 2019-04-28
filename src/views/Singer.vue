<template>
  <div class="singer" ref="singer">
    <ListView @select="selectSinger" :data="singers" ref="list" />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { getSingerList } from '@/assets/api/singer'
import { ERR_OK } from '@/assets/api/config'
import { normalizeSingers } from '@/assets/utils/singer'
import ListView from '@/components/ListView.vue'
import { Mutation } from 'vuex-class'
import * as types from '@/store/mutation-types'
import { PlaylistMixin } from '@/assets/utils/mixin'
import SingerClass from '@/assets/utils/singer'
import Song from '@/assets/utils/song'

@Component({
  components: {
    ListView
  }
})
export default class Singer extends Mixins(PlaylistMixin) {
  @Mutation(types.SET_SINGER) public setSinger!: (singer: SingerClass) => void

  public singers: object[] = []
  public $refs!: {
    singer: HTMLElement
    list: ListView
  }

  public created() {
    this.getSingerList()
  }

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length > 0 ? '60px' : ''
    this.$refs.singer.style.bottom = bottom
    this.$refs.list.refresh()
  }

  public selectSinger(singer: SingerClass) {
    this.$router.push({
      path: `/singer/${singer.id}`
    })
    this.setSinger(singer)
  }

  private getSingerList() {
    getSingerList().then(res => {
      if (res.code === ERR_OK) {
        this.singers = normalizeSingers(res.data.list)
      }
    })
  }
}
</script>

<style lang="stylus" scoped>
.singer
  position: fixed
  top: 88px
  bottom: 0
  width: 100%
</style>
