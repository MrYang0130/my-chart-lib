export class CanvasRenderer {
  constructor(container) {
    let canvas = container.querySelector('canvas')
    if (!canvas) {
      canvas = document.createElement('canvas')
      container.appendChild(canvas)
    }
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.container = container
  }

  setSize(width, height) {
    // 处理高分屏（HiDPI / Retina）显示模糊问题
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.scale(dpr, dpr)
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  render(elements, transform = { x: 0, y: 0 }) {
    this.clear()
    // Canvas 的 transform 是状态，所以我们先保存状态，应用变换，绘制完再恢复
    this.ctx.save()
    this.ctx.translate(transform.x, transform.y)

    elements.forEach((el) => {
      const { tag, attrs } = el

      // Canvas API 是命令式的，我们需要根据 tag 调用不同的方法
      if (tag === 'rect') {
        this.ctx.fillStyle = attrs.fill || 'black'
        this.ctx.fillRect(attrs.x, attrs.y, attrs.width, attrs.height)
      }
      // 未来可以添加其他图形的绘制
      // else if (tag === 'path') { ... }
    })

    this.ctx.restore()
  }
}
