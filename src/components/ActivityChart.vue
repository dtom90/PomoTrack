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
        :data="props.chartData" 
        :options="computedChartOptions" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  type ChartOptions as ChartJsOptions, 
  type TooltipItem 
} from 'chart.js'
import ChartPluginDataLabels from 'chartjs-plugin-datalabels'
import ChartPluginAnnotation, { type AnnotationOptions } from 'chartjs-plugin-annotation'
import { displayChartDuration, displayChartDurationNewline } from '../lib/time'
import cloneDeep from 'lodash.clonedeep'
import getTextColor from '../lib/getTextColor'
import type { PropType } from 'vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, LinearScale, CategoryScale, ChartPluginDataLabels, ChartPluginAnnotation)

interface ChartDataset {
  label?: string;
  backgroundColor?: string | string[];
  data: (number | null)[];
}

interface ChartDataProps {
  labels: string[];
  datasets: ChartDataset[];
}

const props = defineProps({
  chartData: {
    type: Object as PropType<ChartDataProps>,
    required: true
  },
  target: {
    type: Number as PropType<number | null>,
    default: null
  }
})

const chartContainer = ref<HTMLElement | null>(null)
const chartContainerBody = ref<HTMLElement | null>(null)

const defaultChartOptionsInternal: ChartJsOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: 'Time Spent'
      },
      min: 0,
      ticks: {
        maxTicksLimit: 7,
        callback: (value: string | number) => {
          if (typeof value === 'number') {
            return displayChartDurationNewline(value).split('\n');
          }
          return value;
        }
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
        title: (tooltipItems: TooltipItem<'bar'>[]) => tooltipItems[0]?.dataset.label || '',
        label: (tooltipItem: TooltipItem<'bar'>) => tooltipItem.label ? tooltipItem.label + ':' : '',
        afterLabel: (tooltipItem: TooltipItem<'bar'>) => displayChartDuration(tooltipItem.raw as number)
      }
    },
    datalabels: {
      anchor: 'end',
      align: 'start',
      clip: true,
      formatter: (value: number) => displayChartDurationNewline(value),
      color: '#000' 
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

interface BaseTargetLineParts {
  targetLine: Extract<AnnotationOptions, { type: 'line' }>;
  label: Extract<AnnotationOptions, { type: 'label' }>;
}

const baseTargetLine = Object.freeze<BaseTargetLineParts>({
  targetLine: {
    type: 'line' as const,
    scaleID: 'y',
    value: 0,
    borderColor: 'red',
    borderWidth: 2
  },
  label: {
    display: true,
    type: 'label' as const,
    yValue: 0,
    position: {
      y: 'start' as const
    },
    backgroundColor: 'red',
    content: ''
  }
})

const observer = ref<ResizeObserver | null>(null)

const computedChartOptions = computed<ChartJsOptions<'bar'>>(() => {
  const opts = cloneDeep(defaultChartOptionsInternal);
  if (props.target !== null && props.target !== undefined) {
    const annotationsEntry = cloneDeep(baseTargetLine); 
    annotationsEntry.targetLine.value = props.target;
    if (annotationsEntry.label) { 
      annotationsEntry.label.yValue = props.target;
      annotationsEntry.label.content = 'Target: ' + displayChartDuration(props.target);
    }
    
    opts.plugins = opts.plugins || {};
    opts.plugins.annotation = opts.plugins.annotation || { annotations: {} };
    if (!opts.plugins.annotation.annotations) {
        opts.plugins.annotation.annotations = {};
    }
    const currentAnnotations = opts.plugins.annotation.annotations as Record<string, AnnotationOptions>; 
    currentAnnotations['targetLine'] = annotationsEntry.targetLine as AnnotationOptions; 
    currentAnnotations['targetLabel'] = annotationsEntry.label as AnnotationOptions;
  }

  if (props.chartData?.datasets?.[0]?.backgroundColor) {
    if (opts.plugins?.datalabels) {
      const bgColor = props.chartData.datasets[0].backgroundColor;
      if (Array.isArray(bgColor)) {
        opts.plugins.datalabels.color = getTextColor(bgColor[0] || '#000000'); 
      } else if (bgColor) {
        opts.plugins.datalabels.color = getTextColor(bgColor);
      }
    }
  }
  return opts;
});

const updateWidth = () => {
  if (!chartContainerBody.value || !chartContainer.value || !props.chartData?.labels) return
  chartContainerBody.value.style.width = Math.max(
    chartContainer.value.clientWidth,
    140 + 140 * props.chartData.labels.length
  ) + 'px'
}

const scrollRight = () => {
  if (chartContainer.value) {
    chartContainer.value.scrollLeft = chartContainer.value.scrollWidth
  }
}

const observeWidthChange = () => {
  if (!chartContainer.value) return
  observer.value = new ResizeObserver(() => {
    updateWidth()
  })
  observer.value.observe(chartContainer.value)
}

watch(() => props.chartData, (newChartData, oldChartData) => {
  updateWidth()
  if (newChartData?.datasets?.[0]?.label !== oldChartData?.datasets?.[0]?.label) {
    nextTick(() => {
      scrollRight()
    })
  }
}, { deep: true })

onMounted(() => {
  updateWidth()
  nextTick(() => {
    scrollRight()
  })
  observeWidthChange()
})

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

// Expose methods to be called from parent
defineExpose({
  scrollRight
});

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
