<template>
  <ul class="switches">
    <li class="switch-item"
        v-for="(item,index) in switches"
        @click="selectItem(index)"
        :class="{'active':currentIndex===index}">
      <span>{{item.name}}</span>
    </li>
  </ul>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      // 窗口文本数组
      switches: {
        type: Array,
        default: []
      },
      // 当前索引（高亮）
      currentIndex: {
        type: Number,
        default: 0
      }
    },
    methods: {
      /**
       * 选中开关，派发事件
       * @param index
       */
      selectItem(index) {
        this.$emit('switch', index)
      }
    }
  }
</script>

<style scoped lang="stylus" type="text/stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .switches
    display: flex
    align-items: center
    width: 240px
    margin: 0 auto
    border: 1px solid $color-highlight-background
    border-radius: 5px
    .switch-item
      flex: 1
      padding: 8px
      text-align: center
      font-size: $font-size-medium
      color: $color-text-d
      &.active
        background: $color-highlight-background
        color: $color-text
</style>
