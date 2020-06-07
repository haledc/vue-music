import { processSongsUrl, normalizeSongs } from "./song";

const PER_PAGE = 20;
const TYPE_SINGER = "singer";

export function genResult(data, page) {
  let ret = [];
  if (data.zhida && data.zhida.singerid && page === 1) {
    ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } });
  }

  return processSongsUrl(normalizeSongs(data.song.list)).then((songs) => {
    ret = ret.concat(songs);
    return ret;
  });
}

export function checkMore(data) {
  const song = data.song;
  if (
    !song.list.length ||
    song.curnum + song.curpage * PER_PAGE >= song.totalnum
  ) {
    return false;
  }
  return true;
}
