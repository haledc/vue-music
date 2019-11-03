<template>
  <transition appear name="slide">
    <MusicList :title="title" :bg-image="bgImage" :songs="songs" />
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

import MusicList from '@/components/MusicList'

import { getSongList } from '@/assets/api/recommend'
import { ERR_OK } from '@/assets/api/config'
import { processSongsUrl, normalizeSongs } from '@/assets/helpers/song'

export default {
  components: {
    MusicList
  },
  computed: {
    // 歌单名称
    title() {
      return this.disc.dissname
    },

    // 歌单图片
    bgImage() {
      return this.disc.imgurl
    },

    // 获取歌单
    ...mapGetters(['disc'])
  },
  data() {
    return {
      songs: []
    }
  },
  created() {
    this._getSongList()
  },
  methods: {
    // 获取歌单详情-歌曲
    _getSongList() {
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      getSongList(this.disc.dissid).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(normalizeSongs(res.cdlist[0].songlist)).then(
            songs => {
              this.songs = songs
            }
          )
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
