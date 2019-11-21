<template>
  <div id="app">
    <Header />
    <Tab />
    <keep-alive>
      <router-view />
    </keep-alive>
    <Player />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Header from '@/components/Header'
import Tab from '@/components/Tab'
import Player from '@/views/Player'

@Component({
  components: {
    Header,
    Tab,
    Player
  }
})
export default class App extends Vue {}
</script>
