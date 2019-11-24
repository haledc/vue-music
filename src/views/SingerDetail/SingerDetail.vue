<template>
  <transition appear name="slide">
    <MusicList :bg-image="bgImage" :title="title" :songs="songs" />
  </transition>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import MusicList from '@/components/MusicList'
import Song, { processSongUrl, normalizeSongs } from '@/utils/song'
import SingerClass from '@/utils/singer'
import { ERR_OK } from '@/request/config'
import { getSingerDetail } from '@/request/singer'
import { IDiscSong, ISingerResult } from '../../types'

@Component({
  components: {
    MusicList
  }
})
export default class SingerDetail extends Vue {
  @Getter public singer!: SingerClass

  public songs: Song[] = []

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

    getSingerDetail(this.singer.id).then(res => {
      if (res.code === ERR_OK) {
        processSongUrl(normalizeSongs(res.data.list)).then(
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
.slider-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
