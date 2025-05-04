<template>
  <div
    ref="chartContainer"
    class="chart-container"
  >
    <div
      ref="chartContainerBody"
      class="chart-container-body"
    >
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import ChartPluginDataLabels from 'chartjs-plugin-datalabels'
import ChartPluginAnnotation from 'chartjs-plugin-annotation'
import { displayChartDuration, displayChartDurationNewline } from '../lib/time'
import cloneDeep from 'lodash.clonedeep'
import getTextColor from '../lib/getTextColor'

ChartJS.register(Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale, ChartPluginDataLabels, ChartPluginAnnotation)

const defaultChartOptions = {
  maintainAspectRatio: false,
  scales: {
    y: {
      scaleLabel: {
        display: true,
        labelString: 'Time Spent'
      },
      ticks: {
        beginAtZero: true,
        maxTicksLimit: 7,
        stepSize: 0.5,
        callback: mins => displayChartDurationNewline(mins).split('\n')
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      displayColors: false,
      position: 'nearest',
      callbacks: {
        title: (tooltipItems) => tooltipItems[0].dataset.label,
        label: tooltipItem => tooltipItem.label + ':',
        afterLabel: tooltipItem => displayChartDuration(tooltipItem.raw)
      }
    },
    datalabels: {
      anchor: 'end',
      align: 'start',
      clip: true,
      formatter: displayChartDurationNewline
    },
    annotation: {
      annotations: {}
    }
  },
  elements: {
    bar: {
      borderRadius: {
        topLeft: 8,
        topRight: 8,
        bottomLeft: 0,
        bottomRight: 0
      }
    }
  }
}

const baseTargetLine = Object.freeze({
  targetLine: {
    type: 'line',
    scaleID: 'y',
    value: 0,
    borderColor: 'red',
    borderWidth: 2
  },
  label: {
    display: true,
    type: 'label',
    yValue: 0,
    position: {
      y: 'start'
    },
    backgroundColor: 'red',
    content: ''
  }
})

function chartOptions (target = null) {
  const chartOptions = cloneDeep(defaultChartOptions)
  if (target) {
    const annotations = cloneDeep(baseTargetLine)
    annotations.targetLine.value = target
    annotations.label.yValue = target
    annotations.label.content = 'Target: ' + displayChartDuration(target)
    chartOptions.plugins.annotation.annotations = annotations
  }
  return chartOptions
}

export default {
  name: 'BarChart',
  components: { Bar },

  props: {
    chartData: {
      type: Object,
      required: true
    },
    
    target: {
      type: Number,
      default: null
    }
  },
  
  data: function () {
    return {
      chartOptions: {},
      observer: null
    }
  },
  
  watch: {
    target: function (newTarget) {
      this.chartOptions = chartOptions(newTarget)
    },
    
    chartData: function (newChartData, oldChartData) {
      this.updateWith()
      this.chartOptions.plugins.datalabels.color = getTextColor(newChartData.datasets[0].backgroundColor)
      if (newChartData.datasets[0].label !== oldChartData.datasets[0].label) {
        this.$nextTick(() => {
          this.scrollRight()
        })
      }
    }
  },

  mounted () {
    this.chartOptions = chartOptions(this.target, true)
    this.chartOptions.plugins.datalabels.color = getTextColor(this.chartData.datasets[0].backgroundColor)
    this.updateWith()
    this.$nextTick(() => {
      this.scrollRight()
    })
    this.observeWidthChange()
  },
  
  beforeDestroy () {
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  
  methods: {
    updateWith () {
      if (!this.$refs.chartContainerBody) return
      this.$refs.chartContainerBody.style.width = Math.max(
        this.$refs.chartContainer.clientWidth,
        140 + 140 * this.chartData.labels.length
      ) + 'px'
    },
    
    scrollRight () {
      this.$refs.chartContainer.scrollLeft = this.$refs.chartContainer.scrollWidth
    },
    
    observeWidthChange () {
      const chartContainer = this.$refs.chartContainer
      if (!chartContainer) return
      
      this.observer = new ResizeObserver(() => {
        this.updateWith()
      })
      
      this.observer.observe(chartContainer)
    }
  }
}

export { defaultChartOptions }
</script>

<style scoped>

.chart-container {
  width: 100%;
  overflow-x: auto;
}

.chart-container-body {
  min-height: 300px;
}

</style>
