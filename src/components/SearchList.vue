<template>
  <div class="search-list" v-show="searches.length">
    <transition-group name="list" tag="ul">
      <li
        v-for="(item, index) in searches"
        :key="index - 1"
        class="search-item"
        @click="select(item)"
      >
        <span class="text">
          {{ item }}
        </span>
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'

@Component
export default class SearchList extends Vue {
  @Prop({ default: [] }) public searches!: string[]

  @Emit('select')
  public selectItem(item: string) {
    //
  }

  @Emit('delete')
  public deleteOne(item: string) {
    //
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'
@import '~@/assets/styles/mixin.styl'

.search-list
  .search-item
    display: flex
    align-items: center
    height: 40px
    overflow: hidden

    &.list-enter-active, &.list-leave-active
      transition: all 0.1s

    &.list-enter, &.list-leave-to
      height: 0

    .text
      flex: 1
      color: $color-text-l

    .icon
      extend-click()

      .icon-delete
        font-size: $font-size-small
        color: $color-text-d
</style>
