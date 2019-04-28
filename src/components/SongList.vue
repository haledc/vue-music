<template>
  <div class="song-list">
    <ul>
      <li
        class="item"
        v-for="(song, index) in songs"
        :key="song.id"
        @click="selectSong(song, index)"
      >
        <div class="rank" v-show="rank">
          <span :class="getRankCls(index)">{{ getRankText(index) }}</span>
        </div>
        <div class="content">
          <h2 class="name">{{ song.name }}</h2>
          <p class="desc">{{ getDesc(song) }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import Song from '@/assets/utils/song'

@Component
export default class MusicList extends Vue {
  @Prop({ default: [] }) public songs!: Song[]
  @Prop({ default: false }) public rank!: boolean

  @Emit('select')
  public selectSong(song: Song, index: number) {
    //
  }

  public getDesc(song: Song) {
    return `${song.singer} - ${song.album}`
  }

  public getRankCls(index: number) {
    return index <= 2 ? `icon icon${index}` : 'text'
  }

  public getRankText(index: number) {
    if (index > 2) {
      return index + 1
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'
@import '~@/assets/styles/mixin.styl'

.song-list
  .item
    display: flex
    align-items: center
    box-sizing: border-box
    height: 64px
    font-size: $font-size-medium

    .rank
      flex: 0 0 25px
      width: 25px
      margin-right: 30px
      text-align: center

      .icon
        display: inline-block
        width: 25px
        height: 24px
        background-size: 25px 24px

        &.icon0
          bg-image('first')

        &.icon1
          bg-image('second')

        &.icon2
          bg-image('third')

      .text
        color: $color-theme
        font-size: $font-size-large

    .content
      flex: 1
      line-height: 20px
      overflow: hidden

      .name
        no-wrap()
        color: $color-text

      .desc
        no-wrap()
        margin-top: 4px
        color: $color-text-d
</style>
