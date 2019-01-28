export function addClass(el: Element, className: string) {
  el.classList.add(className)
}

export function hasClass(el: Element, className: string) {
  return el.classList.contains(className)
}

export function getData(el: Element, name: string, val: string) {
  const prefix = 'data-'
  name = prefix + name
  return val ? el.setAttribute(name, val) : el.getAttribute(name)
}

const elementStyle = document.createElement('div').style

const vendor = (() => {
  const transformNames: any = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransfrom',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (const key of Object.keys(transformNames)) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false
})()

export function prefixStyle(style: string) {
  if (vendor === false) {
    return ''
  }
  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
