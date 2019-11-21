<template>
  <div class="singer" ref="singer">
    <ListView @select="selectSinger" :data="singers" ref="list" />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'
import ListView from '@/components/ListView'
import * as types from '@/store/mutation-types'
import { normalizeSingers } from '@/utils/singer'
import { PlaylistMixin } from '@/utils/mixin'
import SingerClass from '@/utils/singer'
import Song from '@/utils/song'
import { ERR_OK } from '@/request/config'
import { getSingerList } from '@/request/singer'

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

<style lang="scss" scoped>
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
