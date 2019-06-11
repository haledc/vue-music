// 增加 class
export function addClass(el, className) {
  el.classList.add(className)
}

// 判断是否存在 class
export function hasClass(el, className) {
  return el.classList.contains(className)
}

// 设置或者获取 data-xxx 的值
export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}

// 新建元素的 style
let elementStyle = document.createElement('div').style

// 获取浏览器前缀名称
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  // 遍历对象，如果新建元素的style中有对应的 value，就返回对应的 key
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()

// 封装前缀，兼容浏览器
export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
