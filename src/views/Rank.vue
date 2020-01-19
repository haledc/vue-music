<template>
  <div class="rank" ref="rank">
    <!-- 排行榜列表-滚动组件 -->
    <Scroll :data="topList" class="toplist" ref="scroll">
      <ul>
        <li
          class="item"
          v-for="item in topList"
          :key="item.id"
          @click="selectItem(item)"
        >
          <!-- 排行榜图标 -->
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl" />
          </div>
          <!-- 排行榜歌曲列表 -->
          <ul class="songlist">
            <li
              class="song"
              v-for="(song, index) in item.songList"
              :key="index"
            >
              <span>{{ index + 1 }}</span>
              <span>{{ song.songname }}-{{ song.singername }}</span>
            </li>
          </ul>
        </li>
      </ul>
      <!-- 加载图标 -->
      <div class="loading-container" v-show="!topList.length">
        <Loading />
      </div>
    </Scroll>
    <router-view />
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import Scroll from '@/components/Scroll'
import Loading from '@/components/Loading'
import { getTopList } from '@/request/rank'
import { ERR_OK } from '@/request/config'
import { usePlaylist, useMutations } from '@/hooks'

export default {
  components: {
    Scroll,
    Loading
  },
  setup(props, { root, refs }) {
    const setTopList = useMutations(root, 'SET_TOP_LIST')

    const topList = ref([])

    function handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      refs.rank.style.bottom = bottom
      refs.scroll.refresh()
    }

    function _getTopList() {
      getTopList().then(res => {
        if (res.code === ERR_OK) {
          topList.value = res.data.topList
        }
      })
    }
    _getTopList()

    usePlaylist(root, handlePlaylist)

    function selectItem(item) {
      root.$router.push({
        path: `/rank/${item.id}`
      })
      setTopList(item)
    }

    return {
      topList,
      selectItem
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';
@import '@/assets/styles/mixin.scss';

.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .toplist {
    height: 100%;
    overflow: hidden;

    .item {
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;

      &:last-child {
        padding-bottom: 20px;
      }

      .icon {
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      }

      .songlist {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;

        .song {
          @include no-wrap;
          line-height: 26px;
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
