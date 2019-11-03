<template>
  <transition appear name="slide">
    <MusicList :bg-image="bgImage" :title="title" :songs="songs" />
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

import MusicList from '@/components/MusicList'

import { getSingerDetail } from '@/assets/api/singer'
import { ERR_OK } from '@/assets/api/config'
import { processSongsUrl, normalizeSongs } from '@/assets/helpers/song'

export default {
  components: {
    MusicList
  },
  data() {
    return {
      songs: []
    }
  },
  computed: {
    title() {
      return this.singer.name
    },
    bgImage() {
      return this.singer.avatar
    },
    ...mapGetters(['singer'])
  },

  created() {
    this._getDetail()
  },
  methods: {
    // 获取歌手详情方法
    _getDetail() {
      // 没有歌手id时回退到歌手列表页
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      getSingerDetail(this.singer.id).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(normalizeSongs(res.data.list)).then(songs => {
            this.songs = songs
          })
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
