import { playMode } from './config'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { shuffle } from './util'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class PlaylistMixin extends Vue {}
