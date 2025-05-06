<template>
  <div id="task-tag-list" class="d-flex align-items-center flex-wrap">
    <TagButton
      v-for="tagId in taskTags"
      :key="tagId"
      :tag="tags[tagId]"
      :tag-id="tagId"
      :mini="props.mini"
      :select-tag="selectTag"
      :remove-text="'Remove tag from task'"
      :remove-tag="props.mini ? undefined : removeTag"
      :class="props.mini ? 'tag-button-mini' : 'tag-button'"
    />
    <TagInput
      v-if="!props.mini && props.taskId"
      :task-id="props.taskId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { TaskForState } from '@/types'
import TagButton from './TagButton.vue'
import TagInput from './TagInput.vue'

interface Props {
  taskId?: string | null
  mini?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  taskId: null,
  mini: false
})

const store = useStore()

// Access state and getters directly or via computed refs if needed
const tags = computed(() => store.state.tags)
const tagOrder = computed(() => store.state.tagOrder)
const getTaskById = (id: string): TaskForState | undefined => store.getters.getTaskById(id)

const taskTags = computed(() => {
  if (!props.taskId) return []
  const task = getTaskById(props.taskId)
  if (!task) return []
  // Sort tags based on the global tagOrder
  return [...task.tags].sort((a, b) => tagOrder.value.indexOf(a) - tagOrder.value.indexOf(b))
})

const selectTag = ({ tagId }: { tagId: string }) => {
  if (!props.mini) {
    store.commit('updateTempState', { key: 'modalTagId', value: tagId })
    store.dispatch('openActivityModal')
  }
}

const removeTag = ({ tagId }: { tagId: string }) => {
  if (props.taskId) {
    store.dispatch('removeTaskTag', { taskId: props.taskId, tagId })
    // $forceUpdate() is generally not needed in Vue 3 Composition API
    // State changes should trigger reactivity automatically.
  }
}

</script>

<style scoped lang="scss">
// #task-tag-list {
//   max-width: 224px;
// }

.tag-button-mini {
  margin-right: 4px;
  margin-top: 4px;
}

.tag-button {
  margin-right: 8px;
  margin-top: 8px;
}
</style>
