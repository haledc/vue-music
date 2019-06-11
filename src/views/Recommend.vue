<template>
  <div class="recommend" ref="recommend">
    <!--滚动组件-->
    <Scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <!--轮播图-->
        <div v-if="sliderList.length" class="slider-wrapper">
          <!--轮播图组件-->
          <Slider ref="slider">
            <div v-for="item in sliderList" :key="item.picUrl">
              <a :href="item.linkUrl">
                <!-- needsclick是fastclick内置可点击class配置 -->
                <img class="needsclick" @load="loadImage" :src="item.picUrl" />
              </a>
            </div>
          </Slider>
        </div>
        <!--歌单列表-->
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              @click="selectItem(item)"
              v-for="item in discList"
              :key="item.dissid"
              class="item"
            >
              <div class="icon">
                <!--懒加载，替换属性 :src => v-lazy-->
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
      <!--加载图标-->
      <div class="loading-container" v-show="!discList.length">
        <Loading />
      </div>
    </Scroll>
    <!-- 二级路由渲染 - 歌单详情 -->
    <router-view />
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

import Loading from '@/components/Loading'
import Scroll from '@/components/Scroll'
import Slider from '@/components/Slider'

import { getSliderList, getDiscList } from '@/assets/api/recommend'
import { ERR_OK } from '@/assets/api/config'
import { playlistMixin } from '@/assets/helpers/mixin'

export default {
  mixins: [playlistMixin],
  components: {
    Slider,
    Scroll,
    Loading
  },
  data() {
    return {
      sliderList: [],
      discList: []
    }
  },
  created() {
    this._getSliderList()
    this._getDiscList()
  },
  activated() {
    setTimeout(() => {
      this.$refs.slider && this.$refs.slider.refresh()
    }, 20)
  },
  methods: {
    // 播放列表新增 bottom=60px，使得 mini 播放器 (高度60px) 不会覆盖住播放列表底部
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },

    // 选中歌单，跳转到歌单详情页
    selectItem(item) {
      this.$router.push({
        // 跳转到子路由，绝对路径
        path: `/recommend/${item.dissid}`
      })
      // 设置歌单
      this.setDisc(item)
    },

    // 获取轮播图数据
    _getSliderList() {
      getSliderList().then(res => {
        if (res.code === ERR_OK) {
          this.sliderList = res.data.slider
        }
      })
    },

    // 获取歌单数据
    _getDiscList() {
      getDiscList().then(res => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      })
    },

    // 图片加载时调用子组件方法刷新 BScroll（加载一张图片即可撑开 DOM）
    // 因为 BScroll 对象是用歌单数据来撑开的，当获取到歌单数据后，scroll 组件即创建 BScroll 对象，高度已固定
    // 如果获取轮播图数据比获取歌单数据更慢，实例化 Bscroll 后轮播图高度会占用歌单部分高度，导致歌单列表最后几项无法显示（歌单列表显示不全）
    // 所以，需要加上在有轮播图片加载时后，重新刷新 BScroll 对象，加载一张图片时，刷新一次即可
    loadImage() {
      // 自定义变量checkLoaded，只触发一次
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    },

    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  }
}
</script>

<style scoped lang="stylus">
@import '~@/assets/styles/variable.styl'

/* 父容器高度固定，子元素高度撑开高度，触发滚动 */
.recommend
  position: fixed
  width: 100%
  top: 88px
  bottom: 0

  .recommend-content
    height: 100%
    overflow: hidden

    .slider-wrapper
      position: relative
      width: 100%
      overflow: hidden

    .recommend-list
      .list-title
        height: 65px
        line-height: 65px
        text-align: center
        font-size: $font-size-medium
        color: $color-theme

      .item
        display: flex
        box-sizing: border-box
        align-items: center
        padding: 0 20px 20px 20px

        .icon
          flex: 0 0 60px
          width: 60px
          padding-right: 20px

        .text
          display: flex
          flex-direction: column
          justify-content: center
          flex: 1
          line-height: 20px
          overflow: hidden
          font-size: $font-size-medium

          .name
            margin-bottom: 10px
            color: $color-text

          .desc
            color: $color-text-d

    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
