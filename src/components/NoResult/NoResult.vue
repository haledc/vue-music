<template>
  <div class="no-result">
    <div class="no-result-icon"></div>
    <p class="no-result-text">
      {{ title }}
    </p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class NoResult extends Vue {
  @Prop({ default: '' }) public title!: string
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';
@import '@/assets/styles/mixins.scss';

.no-result {
  text-align: center;

  .no-result-icon {
    width: 86px;
    height: 90px;
    margin: 0 auto;
    @include bg-image('no-result');
    background-size: 86px 90px;
  }

  .no-result-text {
    margin-top: 30px;
    font-size: $font-size-medium;
    color: $color-text-d;
  }
}
</style>
