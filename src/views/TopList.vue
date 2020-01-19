<template>
  <transition appear name="slide">
    <MusicList :rank="rank" :title="title" :bg-image="bgImage" :songs="songs" />
  </transition>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import MusicList from '@/components/MusicList'
import { getMusicList } from '@/request/rank'
import { ERR_OK } from '@/request/config'
import { processSongsUrl, normalizeSongs } from '@/utils/song'

export default {
  components: {
    MusicList
  },
  setup(props, { root }) {
    const songs = ref([])

    const topList = computed(() => root.$store.getters.topList)
    const title = computed(() => topList.value.topTitle)
    const bgImage = computed(() =>
      songs.value.length > 0 ? songs.value[0].image : ''
    )

    function _getMusicList() {
      if (!topList.value.id) {
        root.$router.push('/rank')
        return
      }
      getMusicList(topList.value.id).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(normalizeSongs(res.songlist)).then(val => {
            songs.value = val
          })
        }
      })
    }
    _getMusicList()

    return {
      songs,
      rank: true,
      title,
      bgImage
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
