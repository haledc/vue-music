declare module 'lyric-parser' {
  export default class Lyric {
    constructor(lrc: string, handler: (params: any) => void)
    lrc: string
    tags: object
    lines: string[]
    handler: () => void
    state: number
    curLine: number

    play(startTime: number, skipLast?: boolean): void
    togglePlay(): void
    stop(): void
    seek(offset: number): void
  }
}

declare module 'create-keyframe-animation' {
  interface registerOptions {
    name: string
    animation: object
    present: {
      duration: number
      easing: string
    }
  }

  function registerAnimation(options: registerOptions): void
  function runAnimation(el: Element, name: string, done: () => void): void
  function unregisterAnimation(name: string): void
}

declare module 'good-storage' {
  function get(key: string, def: any): any
  function set(key: string, val: any): void
  function remove(key: string): void
}
