<template>
  <transition name="slide">
    <MusicList
      :rank="rank"
      :title="title"
      :bg-image="bgImage"
      :songs="songs"
    />
  </transition>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import MusicList from '@/components/MusicList.vue'
import { Getter } from 'vuex-class'
import { getMusicList } from '@/assets/api/rank'
import { ERR_OK } from '@/assets/api/config'
import { processSongUrl, normalizeSongs } from '@/assets/utils/song'
import Song from '@/assets/utils/song'
import { TopListInterface } from '@/assets/api/apiInterface'

@Component({
  components: {
    MusicList
  }
})
export default class TopList extends Vue {
  @Getter public topList!: TopListInterface

  public songs: any[] = []
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
    this.getMusicList()
  }

  private getMusicList() {
    if (!this.topList.id) {
      this.$router.push('/rank')
      return
    }

    getMusicList(this.topList.id).then(res => {
      console.log(res)

      if (res.code === ERR_OK) {
        processSongUrl(normalizeSongs(res.songlist as any)).then(
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
