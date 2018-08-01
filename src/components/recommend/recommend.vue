<template>
  <div class="recommend" ref="recommend">
    <!--滚动组件-->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <!--轮播图-->
        <div v-if="sliderList.length" class="slider-wrapper">
          <!--轮播图组件-->
          <slider>
            <div v-for="item in sliderList">
              <a :href="item.linkUrl">
                <!-- needsclick是fastclick内置可点击class配置 -->
                <img class="needsclick" @load="loadImage" :src="item.picUrl"/>
              </a>
            </div>
          </slider>
        </div>
        <!--歌单列表-->
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="item">
              <div class="icon">
                <!--懒加载，替换属性 :src => v-lazy-->
                <img v-lazy="item.imgurl" width="60" height="60"/>
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
        <loading/>
      </div>
    </scroll>
    <!--二级路由渲染-歌单详情-->
    <router-view/>
  </div>
</template>

<script type="text/ecmascript-6">
  import Loading from "base/loading/loading"
  import Scroll from "base/scroll/scroll"
  import Slider from "base/slider/slider"
  import {getSliderList, getDiscList} from "api/recommend"
  import {ERR_OK} from "api/config"
  import {playlistMixin} from 'common/js/mixin'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
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
    methods: {
      /**
       * 播放列表新增bottom=60px，使得mini播放器(高度60px)不会覆盖住播放列表底部
       * @param playlist
       */
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      /**
       * 选中歌单，跳转到歌单详情页
       * @param item
       */
      selectItem(item) {
        this.$router.push({
          // 跳转到子路由，绝对路径
          path: `/recommend/${item.dissid}`
        })
        // 设置歌单
        this.setDisc(item)
      },
      /**
       * 获取轮播图数据
       * @private
       */
      _getSliderList() {
        getSliderList().then((res) => {
          if (res.code === ERR_OK) {
            this.sliderList = res.data.slider
          }
        })
      },
      /**
       * 获取歌单数据
       * @private
       */
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },
      /**
       * 图片加载时调用子组件方法刷新BScroll（加载一张图片即可撑开DOM）
       * 因为BScroll对象是用歌单数据来撑开的，当获取到歌单数据后，scroll组件即创建BScroll对象，高度已固定
       * 如果获取轮播图数据比获取歌单数据更慢，实例化Bscroll后轮播图高度会占用歌单部分高度，导致歌单列表最后几项无法显示（歌单列表显示不全）
       * 所以，需要加上在有轮播图片加载时后，重新刷新BScroll对象，加载一张图片时，刷新一次即可
       */
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
    },
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"

  /*父容器高度固定，子元素高度撑开高度，触发滚动*/
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
