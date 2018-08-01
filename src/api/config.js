/**
 * 基本参数
 * @type {{g_tk: number, inCharset: string, outCharset: string, notice: number, format: string}}
 */
export const commonParams = {
  g_tk: 1928093487,
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'jsonp'
}

/**
 * jsonp参数选项
 * @type {{param: string, prefix: string}}
 */
export const options = {
  param: 'jsonpCallback',
  prefix: 'jp'
}

/**
 * 成功取回状态码
 * @type {number}
 */
export const ERR_OK = 0
