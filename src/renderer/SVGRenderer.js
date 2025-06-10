export class SVGRenderer {
  constructor(container) {
    // 寻找或创建一个 SVG 元素
    let svg = container.querySelector('svg')
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      container.appendChild(svg)
    }
    this.svg = svg
    // 创建一个用于 transform 的 group
    this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.svg.appendChild(this.g)
  }
  // 设置 SVG 的宽高
  setSize(width, height) {
    this.svg.setAttribute('width', width)
    this.svg.setAttribute('height', height)
  }

  // 清空 SVG 内容
  clear() {
    // 只清空 group 的内容
    this.g.innerHTML = ''
  }

  // 绘制（或更新）元素
  // 这里我们用一种简单粗暴但有效的方式：每次重绘都清空再重建
  // 高级实现会做 diff，但目前这样更清晰
  render(elements, { transform }) {
    this.clear()
    this.g.setAttribute('transform', transform)

    elements.forEach((el) => {
      const { tag, attrs } = el
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag)
      Object.entries(attrs).forEach(([key, value]) => {
        // 在 SVG 中，属性名通常是小写
        node.setAttribute(key.toLowerCase(), value)
      })
      this.g.appendChild(node)
    })
  }
}
