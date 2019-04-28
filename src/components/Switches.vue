<template>
  <ul class="switches">
    <li
      v-for="(item, index) in switches"
      :key="index"
      @click="selectItem(index)"
      class="switch-item"
      :class="{ active: currentIndex === index }"
    >
      <span>{{ item.name }}</span>
    </li>
  </ul>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'

@Component
export default class Switches extends Vue {
  @Prop({ default: [] }) public switches!: object[]
  @Prop({ default: 0 }) public currentIndex!: number

  @Emit('switch')
  public selectItem(index: number) {
    //
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/variable.styl'

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
