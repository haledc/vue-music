<template>
  <transition appear name="slide">
    <MusicList :bg-image="bgImage" :title="title" :songs="songs" />
  </transition>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import MusicList from '@/components/MusicList'
import { getSingerDetail } from '@/request/singer'
import { ERR_OK } from '@/request/config'
import { processSongsUrl, normalizeSongs } from '@/utils/song'

export default {
  components: {
    MusicList
  },
  setup(props, { root }) {
    const songs = ref([])

    const singer = computed(() => root.$store.getters.singer)
    const title = computed(() => singer.value.name)
    const bgImage = computed(() => singer.value.avatar)

    function _getDetail() {
      if (!singer.value.id) {
        root.$router.push('/singer')
        return
      }
      getSingerDetail(singer.value.id).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(normalizeSongs(res.data.list)).then(val => {
            songs.value = val
          })
        }
      })
    }

    _getDetail()

    return {
      songs,
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
