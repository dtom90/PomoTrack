<template>
  <div id="task-tag-list" class="d-flex align-items-center flex-wrap">
    <TagButton
      v-for="tagId in taskTagIds"
      :key="tagId"
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
import TagButton from './TagButton.vue'
import TagInput from './TagInput.vue'
import type { Tag } from '@/types'

interface Props {
  taskId?: string | null
  mini?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  taskId: null,
  mini: false
})

const store = useStore()

const taskTagIds = computed<string[]>(() => {
  if (!props.taskId) return []
  const tagOrder = store.state.tagOrder
  if (!(props.taskId in store.state.taskTagsMap)) {
    return []
  }
  const tagIds = store.state.taskTagsMap[props.taskId]
  return tagIds.map((tagId: string) => store.state.tags[tagId]).sort((a: Tag, b: Tag) => tagOrder.indexOf(a.id) - tagOrder.indexOf(b.id)).map((tag: Tag) => tag.id)
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
  }
}

</script>

<style scoped lang="scss">
.tag-button-mini {
  margin-right: 4px;
  margin-top: 4px;
}

.tag-button {
  margin-right: 8px;
  margin-top: 8px;
}
</style>
