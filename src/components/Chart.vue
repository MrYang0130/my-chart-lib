<script setup>
import { SVGRenderer } from '../renderer/SVGRenderer'
import { CanvasRenderer } from '../renderer/CanvasRenderer'

// 引入 d3-scale 的两种主要 scale 类型
import { scaleBand, scaleLinear } from 'd3-scale'
import { ref, provide, onMounted, reactive, watch, computed, onUnmounted } from 'vue'
const props = defineProps({
  // 图表数据
  data: { type: Array, required: true },
  // 画布宽度
  width: { type: Number, default: 600 },
  // 画布高度
  height: { type: Number, default: 400 },
  // 新增：定义图表边距
  margin: {
    type: Object,
    default: () => ({ top: 20, right: 20, bottom: 30, left: 40 }),
  },
  renderer: {
    type: String,
    default: 'svg', //默认为 ‘svg’
    validator: (value) => ['svg', 'canvas'].includes(value),
  },
})

const container = ref(null) // 这个 div 将作为渲染器的挂载点
let rendererInstance = null // 存储渲染器实例

// 存储子组件（几何标记）实例的响应式数据
const geometries = reactive([])

// 核心：注册子组件的方法
const registerGeometry = (geometry) => {
  geometries.push(geometry)
  // 当有新的 geometry 注册时，也需要重新计算
  if (scales.x) {
    renderChart()
  }
}

// 核心：使用 provide/inject 向下级组件暴露 chart 实例
// 这样任何子组件都可以通过 inject('chart') 来访问父组件的方法和数据
provide('chart', {
  registerGeometry,
})

// 计算实际绘图区域的尺寸
const innerWidth = computed(() => props.width - props.margin.left - props.margin.right)
const innerHeight = computed(() => props.height - props.margin.top - props.margin.bottom)

// ---- 新增：Scale 计算逻辑 ----
const scales = reactive({
  x: null,
  y: null,
})

// ---- 将 scale 创建和渲染逻辑合并到一个函数中 ----
const renderedElements = ref([]) // 用于存储要渲染的 SVG 元素配置

const renderChart = () => {
  if (!rendererInstance || geometries.length === 0 || props.data.length === 0) return

  // 1. 创建 Scales (和之前逻辑一样)
  const mainGeometry = geometries[0]
  const { x: xField, y: yField } = mainGeometry.props

  // 创建 X 轴的 scale （通常是分类数据）
  // scaleBand 用于离散的、有序的数据，比如柱状图的分类轴
  const xDomain = props.data.map((d) => d[xField])
  scales.x = scaleBand()
    .domain(xDomain) // 输入域：['A', 'B', 'C', 'D']
    .range([0, innerWidth.value]) // 输出范围：[0, 绘图区宽度]
    .padding(0.1) // 柱子之间的间距

  // 创建 Y 轴的 scale (通常是连续数据)
  // scaleLinear 用于连续的数值数据
  const yDomain = [0, Math.max(...props.data.map((d) => d[yField]))]
  scales.y = scaleLinear()
    .domain(yDomain) // 输入域：[0, 最大值]
    .range([innerHeight.value, 0]) // 输出范围：[绘图区高度, 0] (SVG y轴向下为正)

  // 2. 计算渲染元素
  const elements = []
  if (mainGeometry.type === 'interval') {
    props.data.forEach((d, index) => {
      const x = scales.x(d[xField])
      const y = scales.y(d[yField])
      const width = scales.x.bandwidth() // scaleBand 提供了计算条带宽度的便捷方法
      const height = innerHeight.value - y // 高度是绘图区高度减去 y 坐标

      elements.push({
        key: `${mainGeometry.type}-${index}`, // v-for 的 key
        tag: 'rect', // SVG 标签名
        attrs: { x, y, width, height, fill: 'steelblue' },
      })
    })
  }
  // 在这里可以添加 else if (mainGeometry.type === 'line') { ... } 来支持其他图表

  if (props.renderer === 'svg') {
    // 对于 SVG，我们需要将 g 元素的 transform 属性应用到每个元素上
    const transformedElements = elements.map((el) => ({
      ...el,
      attrs: {
        ...el.attrs,
        transform: `translate(${props.margin.left}, ${props.margin.top})`,
      },
    }))
    // 由于 SVG 元素本身无法组合 transform，我们直接在父级 g 元素上应用
    // 更优雅的 SVG 做法是创建一个 <g> 元素，然后把所有子元素 append 进去
    // 这里为了简化，我们直接在 renderer 内部处理
    rendererInstance.render(elements, {
      transform: `translate(${props.margin.left}, ${props.margin.top})`,
    })
  } else {
    rendererInstance.render(elements, {
      x: props.margin.left,
      y: props.margin.top,
    })
  }
}

// 在 onMounted 中初始化渲染器
onMounted(() => {
  if (container.value) {
    if (props.renderer === 'svg') {
      rendererInstance = new SVGRenderer(container.value)
    } else {
      rendererInstance = new CanvasRenderer(container.value)
    }
    rendererInstance.setSize(props.width, props.height)
    renderChart()
  }
})

// 监听数据变化，当数据更新时重新绘制图表
watch(
  [() => props.data, () => props.renderer],
  () => {
    // 如果渲染器类型变化，需要销毁旧的，创建新的
    if (
      rendererInstance &&
      rendererInstance.constructor.name !== `${props.renderer.toUpperCase()}Renderer`
    ) {
      onMounted()
    }
    rendererInstance.setSize(props.width, props.height)
    renderChart()
  },
  { deep: true },
)

// 组件卸载时清理
onUnmounted(() => {
  if (rendererInstance) {
    rendererInstance.clear()
    // 移除 canvas/svg 元素
    if (container.value) {
      container.value.innerHTML = ''
    }
    rendererInstance = null
  }
})
</script>

<template>
  <!-- container 现在是渲染器的根，slot 用于逻辑组件 -->
  <div ref="container" class="chart-container">
    <!-- 默认的插槽，用于接收 <Interval>, <Line> 等子组件 -->
    <!-- 这些子组件在模板中虽然不渲染任何可见内容，但它们的 setup 脚本会被执行 -->
    <slot></slot>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
}
</style>
