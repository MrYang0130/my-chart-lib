<script setup>
import { ref } from 'vue'
import Chart from './components/Chart.vue'
import Interval from './components/Interval.vue'

// 准备一份模拟数据
const chartData = ref([
  { category: 'A', value: 30 },
  { category: 'B', value: 80 },
  { category: 'C', value: 45 },
  { category: 'D', value: 60 },
])
</script>

<template>
  <div>
    <h1>SVG Renderer</h1>
    <Chart :data="chartData" :width="500" :height="300" renderer="svg">
      <Interval x="category" y="value" />
    </Chart>

    <h1 style="margin-top: 50px">Canvas Renderer</h1>
    <Chart :data="chartData" :width="500" :height="300" renderer="canvas">
      <Interval x="category" y="value" />
    </Chart>
  </div>
</template>

<style scoped></style>
