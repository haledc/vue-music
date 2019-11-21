import Song from './song'

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(arr: Song[]) {
  const cloneArr = arr.slice()
  for (let i = 0; i < cloneArr.length; i++) {
    const j = getRandomInt(0, i)
    ;[cloneArr[i], cloneArr[j]] = [cloneArr[j], cloneArr[i]]
  }

  return cloneArr
}

export function debounce(func: () => void, delay: number) {
  let timer: number
  return function(this: void, ...args: any) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => func.apply(this, args), delay)
  }
}
