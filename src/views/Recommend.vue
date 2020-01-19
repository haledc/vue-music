<template>
  <div class="recommend" ref="recommend">
    <!-- 滚动组件 -->
    <Scroll ref="scroll" class="recommend-content" :data="state.discList">
      <div>
        <!-- 轮播图 -->
        <div v-if="state.sliderList.length" class="slider-wrapper">
          <!--轮播图组件-->
          <Slider ref="slider">
            <div v-for="item in state.sliderList" :key="item.picUrl">
              <a :href="item.linkUrl">
                <!-- needsclick是fastclick内置可点击class配置 -->
                <img @load="loadImage" :src="item.picUrl" />
              </a>
            </div>
          </Slider>
        </div>
        <!-- 歌单列表 -->
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              @click="selectItem(item)"
              v-for="item in state.discList"
              :key="item.dissid"
              class="item"
            >
              <div class="icon">
                <img v-lazy="item.imgurl" width="60" height="60" />
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 加载图标 -->
      <div class="loading-container" v-show="!state.discList.length">
        <Loading />
      </div>
    </Scroll>
    <!-- 二级路由挂载 - 歌单详情 -->
    <router-view />
  </div>
</template>

<script>
import { reactive, onActivated } from '@vue/composition-api'
import { mapMutations } from 'vuex'
import Loading from '@/components/Loading'
import Scroll from '@/components/Scroll'
import Slider from '@/components/Slider'
import { getSliderList, getDiscList } from '@/request/recommend'
import { ERR_OK } from '@/request/config'
import { usePlaylist, useMutations } from '@/hooks'

export default {
  components: {
    Slider,
    Scroll,
    Loading
  },
  setup(props, { root, refs }) {
    const setDisc = useMutations(root, 'SET_DISC')

    const state = reactive({
      sliderList: [],
      discList: []
    })

    let checkLoaded = false

    onActivated(() => {
      setTimeout(() => {
        refs.slider && refs.slider.refresh()
      }, 20)
    })

    function handlePlaylist(playlist) {
      const bottom = playlist.value.length > 0 ? '60px' : ''
      refs.recommend.style.bottom = bottom
      refs.scroll.refresh()
    }

    usePlaylist(root, handlePlaylist)

    function selectItem(item) {
      root.$router.push({
        path: `/recommend/${item.dissid}`
      })
      setDisc(item)
    }

    function _getSliderList() {
      getSliderList().then(res => {
        if (res.code === ERR_OK) {
          state.sliderList = res.data.slider.slice(0, 5)
        }
      })
    }
    _getSliderList()

    function _getDiscList() {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          state.discList = res.data.list
        }
      })
    }
    _getDiscList()

    function loadImage() {
      if (!checkLoaded) {
        refs.scroll.refresh()
        checkLoaded = true
      }
    }

    return {
      state,
      loadImage,
      selectItem
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

// 父容器高度固定，子元素高度撑开高度，触发滚动
.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }

      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }

        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;

          .name {
            margin-bottom: 10px;
            color: $color-text;
          }

          .desc {
            color: $color-text-d;
          }
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
