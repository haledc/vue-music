<template>
  <div class="recommend" ref="recommend">
    <Scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="sliderList.length" class="slider-wrapper">
          <Slider ref="slider">
            <div v-for="(item, index) in sliderList" :key="index">
              <a :href="item.linkUrl">
                <img
                  :src="item.picUrl"
                  alt="picUrl"
                  class="needsclick"
                  @load="loadImage"
                />
              </a>
            </div>
          </Slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li
              v-for="item in discList"
              :key="item.dissid"
              class="item"
              @click="selectDisc(item)"
            >
              <div class="icon">
                <img v-lazy="item.imgurl" alt="imgurl" width="60" height="60" />
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <Loading />
      </div>
    </Scroll>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Loading from '@/components/Loading.vue'
import Scroll from '@/components/Scroll.vue'
import Slider from '@/components/Slider.vue'
import { getSliderList, getDiscList } from '@/assets/api/recommend'
import { ERR_OK } from '@/assets/api/config'
import { Mutation } from 'vuex-class'
import * as types from '@/store/mutation-types'
import { AxiosResponse } from 'axios'
import Song from '@/assets/utils/song'

@Component({
  components: {
    Scroll,
    Slider,
    Loading
  }
})
export default class Recommend extends Vue {
  public discList: object[] = []
  public sliderList: object[] = []
  public checkLoaded: boolean = false
  public $refs!: {
    slider: Slider
    scroll: Scroll
    recommend: HTMLElement
  }

  @Mutation(types.SET_DISC) public setDisc!: (item: object) => void

  public created() {
    this.getSliderList()
    this.getDiscList()
  }

  public activated() {
    setTimeout(() => {
      this.$refs.slider && this.$refs.slider.refresh()
    }, 20)
  }

  public loadImage() {
    if (!this.checkLoaded) {
      this.$refs.scroll.refresh()
      this.checkLoaded = true
    }
  }

  public handlePlaylist(playlist: Song[]) {
    const bottom = playlist.length > 0 ? '60px' : ''
    this.$refs.recommend.style.bottom = bottom
    this.$refs.scroll.refresh()
  }

  public selectDisc(item: { dissid: string }) {
    this.$router.push(`/recommend/${item.dissid}`)
    this.setDisc(item)
  }

  private getSliderList() {
    getSliderList().then(res => {
      if (res.code === ERR_OK) {
        this.sliderList = res.data.slider
      }
    })
  }

  private getDiscList() {
    getDiscList().then(res => {
      if (res.code === ERR_OK) {
        this.discList = res.data.list
      }
    })
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'

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
