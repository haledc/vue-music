/**
 * 增加class属性
 * @param el
 * @param className
 */
export function addClass(el, className) {
  // if (hasClass(el, className)) {
  //   return
  // }
  // // class => [class]
  // let newClass = el.className.split(' ')
  // // [class, newClass]
  // newClass.push(className)
  // // 'class newClass'
  // el.className = newClass.join(' ')

  el.classList.add(className)
}

/**
 * 判断是否有这个class名称
 * @param el
 * @param className
 * @return {boolean}
 */
export function hasClass(el, className) {
  // reg = /(^|\s)className(\s|$)/  即 ^className$（单个class时）  空格className空格（多个class时）
  // let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  // return reg.test(el.className)
  return el.classList.contains(className)
}

/**
 * 设置或者获取 data-xxx 的值
 * @param el
 * @param name
 * @param val
 * @return {*}
 */
export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}

// 新建元素的style
let elementStyle = document.createElement('div').style

/**
 * 获取浏览器前缀名称
 * 使用立即执行函数获取
 * @type {*|boolean}
 */
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransfrom',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  // 遍历对象，如果新建元素的style中有对应的value，就返回对应的key
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()

/**
 * 封装前缀，兼容浏览器
 * @param style
 * @return {*}
 */
export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
