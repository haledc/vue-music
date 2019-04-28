<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input
      type="text"
      class="box"
      v-model="query"
      :placeholder="placeholder"
      ref="query"
    />
    <i class="icon-dismiss" v-show="query" @click="clear"></i>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import { debounce } from '@/assets/utils/util'

@Component
export default class SearchBox extends Vue {
  @Prop({ default: '搜索歌曲、歌手' }) public placeholder!: string

  public query: string = ''
  public $refs!: {
    query: HTMLFormElement
  }

  @Watch('query')
  @Emit('query')
  public onChangeQueryInBox(newQuery: string) {
    debounce(() => {
      this.$emit('query', newQuery)
    }, 200)
  }

  public clear() {
    this.query = ''
  }

  public setQuery(query: string) {
    this.query = query
  }

  /**
   * 在滚动之前，隐藏手机端的输入键盘
   * 只有在手机端才有效
   */
  public blur() {
    this.$refs.query.blur()
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'

.search-box
  display: flex
  align-items: center
  box-sizing: border-box
  width: 100%
  padding: 0 6px
  height: 40px
  background: $color-highlight-background
  border-radius: 6px

  .icon-search
    font-size: 24px
    color: $color-background

  .box
    flex: 1
    margin: 0 5px
    line-height: 18px
    background: $color-highlight-background
    color: $color-text
    font-size: $font-size-medium
    outline: 0

    &::placeholder
      color: $color-text-d

  .icon-dismiss
    font-size: 16px
    color: $color-background
</style>
