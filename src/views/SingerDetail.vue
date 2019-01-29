<template>
  <transition name="slide">
    <MusicList
      :bg-image="bgImage"
      :title="title"
      :songs="songs"
    />
  </transition>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import MusicList from '@/components/MusicList.vue'
import { Getter } from 'vuex-class'
import { getSingerDetail } from '@/assets/api/singer'
import { processSongUrl, normalizeSongs } from '@/assets/utils/song'
import { ERR_OK } from '@/assets/api/config'

@Component({
  components: {
    MusicList
  }
})
export default class SingerDetail extends Vue {
  @Getter
  public singer: any

  public songs: any[] = []

  get title() {
    return this.singer.name
  }

  get bgImage() {
    return this.singer.avatar
  }

  public created() {
    this.getDetail()
  }

  private getDetail() {
    if (!this.singer.id) {
      this.$router.push('/singer')
      return
    }

    getSingerDetail(this.singer.id).then((res: any) => {
      if (res.code === ERR_OK) {
        processSongUrl(normalizeSongs(res.data.list)).then(
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

.slide-enter, .slider-leave-to
  transform: translate3d(100%, 0, 0)
</style>
