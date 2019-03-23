<template>
  <transition appear name="slide">
    <MusicList
      :title="title"
      :bg-image="bgImage"
      :songs="songs"
    ></MusicList>
  </transition>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import MusicList from '@/components/MusicList.vue'
import { Getter } from 'vuex-class'
import { getSongList } from '@/assets/api/recommend'
import { ERR_OK } from '@/assets/api/config'
import { processSongUrl, normalizeSongs } from '@/assets/utils/song'
import { DiscInterface, SongInterface } from '@/assets/api/apiInterface'
import Song from '@/assets/utils/song'

@Component({
  components: {
    MusicList
  }
})
export default class Disc extends Vue {
  @Getter public disc!: DiscInterface

  public songs: Song[] = []

  public created() {
    this.getSongList()
  }

  get title() {
    return this.disc.dissname
  }

  get bgImage() {
    return this.disc.imgurl
  }

  private getSongList() {
    if (!this.disc.dissid) {
      this.$router.push('/recommend')
      return
    }

    getSongList(this.disc.dissid).then(res => {
      if (res.code === ERR_OK) {
        processSongUrl(normalizeSongs(res.cdlist[0].songlist)).then(
          songs => (this.songs = songs)
        )
      }
    })
  }
}
</script>

<style lang="stylus" scoped>
.slide-enter-active, .slide-leave-active
  transition: all 0.3s

.slide-enter, .slide-leave-to
  transform: translate3d(100%, 0, 0)
</style>
