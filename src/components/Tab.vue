<template>
  <div class="tab">
    <router-link
      v-for="router in routerContent"
      :key="router.text"
      tag="div"
      class="tab-item"
      :to="router.to"
    >
      <span class="tab-link">{{ router.text }}</span>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Tab extends Vue {
  private routerContent = [
    { to: '/recommend', text: '推荐' },
    { to: '/singer', text: '歌手' },
    { to: '/rank', text: '排行' },
    { to: '/search', text: '搜索' }
  ]
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'

.tab
  display: flex
  height: 44px
  line-height: 44px
  font-size: $font-size-medium

  .tab-item
    flex: 1
    text-align: center

    .tab-link
      padding-bottom: 5px
      color: $color-text-l

    &.router-link-active
      .tab-link
        color: $color-theme
        border-bottom: 2px solid $color-theme
</style>
