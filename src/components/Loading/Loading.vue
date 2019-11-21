<template>
  <div class="loading">
    <img
      src="@/assets/images/loading.gif"
      alt="loading.git"
      width="32"
      height="32"
    />
    <p class="desc">{{ title }}</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Loading extends Vue {
  @Prop({ default: '' }) public title!: string
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.loading {
  width: 100%;
  text-align: center;

  .desc {
    line-height: 20px;
    font-size: $font-size-small;
    color: $color-text-l;
  }
}
</style>
