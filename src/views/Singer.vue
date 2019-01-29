<template>
  <div
    class="singer"
    ref="singer"
  >
    <ListView
      @select="selectSinger"
      :data="singers"
      ref="list"
    />
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { getSingerList } from '@/assets/api/singer'
import { ERR_OK } from '@/assets/api/config'
import { normalizeSinger } from '@/assets/utils/singer'
import ListView from '@/components/ListView.vue'
import { Mutation } from 'vuex-class'
import * as types from '@/store/mutation-types'
import { PlaylistMixin } from '@/assets/utils/mixin'

@Component({
  components: {
    ListView
  }
})
export default class Singer extends PlaylistMixin {
  @Mutation(types.SET_SINGER)
  public setSinger: any

  public singers: any[] = []
  public $refs: any

  public created() {
    this.getSingerList()
  }

  public handlePlaylist(playlist: any[]) {
    const bottom = playlist.length > 0 ? '60px' : ''
    this.$refs.singer.style.bottom = bottom
    this.$refs.list.refresh()
  }

  public selectSinger(singer: any) {
    this.$router.push({
      path: `/singer/${singer.id}`
    })
    this.setSinger(singer)
  }

  private getSingerList() {
    getSingerList().then((res: any) => {
      if (res.code === ERR_OK) {
        this.singers = normalizeSinger(res.data.list)
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
