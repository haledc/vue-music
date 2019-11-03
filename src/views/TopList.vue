<template>
  <transition appear name="slide">
    <MusicList :rank="rank" :title="title" :bg-image="bgImage" :songs="songs" />
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

import MusicList from '@/components/MusicList'

import { getMusicList } from '@/assets/api/rank'
import { ERR_OK } from '@/assets/api/config'
import { processSongsUrl, normalizeSongs } from '@/assets/helpers/song'

export default {
  components: {
    MusicList
  },
  data() {
    return {
      songs: [],
      rank: true
    }
  },
  computed: {
    // 排行榜名称
    title() {
      return this.topList.topTitle
    },

    // 排行榜图片 (第一首歌的图片)
    bgImage() {
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    },

    ...mapGetters(['topList'])
  },
  created() {
    this._getMusicList()
  },
  methods: {
    // 获得排行榜歌曲列表
    _getMusicList() {
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      getMusicList(this.topList.id).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(normalizeSongs(res.songlist)).then(songs => {
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
