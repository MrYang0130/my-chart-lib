<script setup>
import { inject, onMounted, reactive } from 'vue'

// 定义 props，接收映射到 x 和 y 轴的数据字段名
const props = defineProps({
  x: { type: String, required: true },
  y: { type: String, required: true },
})

// 通过 inject 获取父组件 Chart 提供的上下文
const chart = inject('chart')

if (!chart) {
  throw new Error('<Interval> must be used inside a <Chart> component.')
}

// 准备要注册给父组件的配置信息
// 使用 reactive 包装，以便将来可能动态修改（例如，交互时高亮）
const geometryConfig = reactive({
  type: 'interval', // 几何类型
  props: props, // 映射关系
})

// 在组件挂载时，调用父组件的注册方法
onMounted(() => {
  chart.registerGeometry(geometryConfig)
})

// 这个组件没有 template，因为它不渲染任何实际的 DOM
// 它是一个 “逻辑组件” 或 “配置组件”
</script>
