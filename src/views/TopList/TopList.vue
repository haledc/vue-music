<template>
  <transition appear name="slide">
    <MusicList :rank="rank" :title="title" :bg-image="bgImage" :songs="songs" />
  </transition>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import MusicList from '@/components/MusicList'
import { processSongUrl, normalizeSongs } from '@/utils/song'
import Song from '@/utils/song'
import { ERR_OK } from '@/request/config'
import { getTopSongList } from '@/request/rank'
import { ITopList } from '@/types'

@Component({
  components: {
    MusicList
  }
})
export default class TopList extends Vue {
  @Getter public topList!: ITopList

  public songs: Song[] = []
  public rank: boolean = true

  get title() {
    return this.topList.topTitle
  }

  get bgImage() {
    if (this.songs.length) {
      return this.songs[0].image
    }
    return ''
  }

  public created() {
    this.getTopSongList()
  }

  private getTopSongList() {
    if (!this.topList.id) {
      this.$router.push('/rank')
      return
    }

    getTopSongList(this.topList.id).then(res => {
      if (res.code === ERR_OK) {
        processSongUrl(normalizeSongs(res.songlist)).then(
          songs => (this.songs = songs)
        )
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
