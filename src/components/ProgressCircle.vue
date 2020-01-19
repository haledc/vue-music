<template>
  <div class="progress-circle">
    <svg
      :width="radius"
      :height="radius"
      viewBox="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 内圈 -->
      <circle
        class="progress-background"
        r="50"
        cx="50"
        cy="50"
        fill="transparent"
      ></circle>
      <!-- 外圈 -->
      <circle
        class="progress-bar"
        r="50"
        cx="50"
        cy="50"
        fill="transparent"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"
      ></circle>
    </svg>
    <slot />
  </div>
</template>

<script>
import { ref, computed } from '@vue/composition-api'

export default {
  props: {
    radius: {
      type: Number,
      default: 32
    },
    percent: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const dashArray = ref(Math.PI * 100)
    const dashOffset = computed(() => (1 - props.percent) * dashArray.value)
    return {
      dashArray,
      dashOffset
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

.progress-circle {
  position: relative;

  circle {
    stroke-width: 8px;
    transform-origin: center;

    &.progress-background {
      transform: scale(0.9);
      stroke: $color-theme-d;
    }

    &.progress-bar {
      transform: scale(0.9) rotate(-90deg);
      stroke: $color-theme;
    }
  }
}
</style>
