<template>
  <b-nav-item-dropdown
    id="navbarTagsDropdown"
    ref="dropdownRef"
    text="Tags"
    no-caret
    boundary="viewport"
  >
    <template #button-content>
      <span>Tags</span>
    </template>

    <draggable
      v-model="tagOrder"
      :item-key="(tagId: string) => tagId"
      ghost-class="draggable-ghost"
      :animation="200"
      @start="isDragging = true"
      @end="onDragEnd"
      tag="div"
    >
      <template #item="{element: tagId}">
        <div
          :key="tagId"
          class="submenu-button-wrapper"
        >
          <BDropdownItem
            class="tag-dropdown-item"
          >
            <div
              class="d-flex justify-content-between align-items-center w-100"
              @click.stop="toggleSubmenu(tagId)"
            >
              <img
                src="@/assets/icons/dots-6-vertical.svg"
                alt="Drag Tag"
                class="drag-handle"
              >
              <div
                class="flex-1"
              >
                <TagButton
                  :tag="tags[tagId]"
                  :tag-id="tagId"
                  class="ms-3"
                />
              </div>
              <div
                class="submenu-indicator-wrapper"
              >
                <font-awesome-icon
                  icon="chevron-right"
                  class="submenu-indicator"
                />
              </div>
            </div>
          </BDropdownItem>

          <!-- Submenu -->
          <div
            class="submenu tag-submenu"
            :class="{ 'active': activeSubmenu === tagId }"
            @click.stop
          >
            <TagEditMenu
              :ref="(el) => setTagEditMenuRef(tagId, el)"
              :tag-id="tagId"
              @update-tag="closeSubmenu"
            />
          </div>
        </div>
      </template>
    </draggable>
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUpdate } from 'vue'
import { useStore } from 'vuex'
import type { Tag } from '@/types'
import TagButton from '../TagButton.vue'
import TagEditMenu from '../TagEditMenu.vue'
import draggable from 'vuedraggable'
import type { BNavItemDropdown } from 'bootstrap-vue-next'

const store = useStore()

const dropdownRef = ref<InstanceType<typeof BNavItemDropdown> | null>(null)
const tagEditMenuRefs = ref<Record<string, InstanceType<typeof TagEditMenu>>>({})
const activeSubmenu = ref<string | null>(null)
const isDragging = ref(false)

onBeforeUpdate(() => {
  tagEditMenuRefs.value = {}
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setTagEditMenuRef = (tagId: string, el: any) => {
  if (el) {
    tagEditMenuRefs.value[tagId] = el as InstanceType<typeof TagEditMenu>
  }
}

const tags = computed<Record<string, Tag>>(() => store.state.tags)
const tagOrder = computed<string[]>({
  get: () => store.state.tagOrder,
  set: (newOrder: string[]) => {
    store.dispatch('reorderTags', { newOrder })
  }
})

watch(activeSubmenu, (tagId) => {
  if (tagId) {
    const tag = tags.value[tagId]
    if (tag && tagEditMenuRefs.value[tagId]) {
      tagEditMenuRefs.value[tagId].refreshTagNameAndColor?.()
    }
  }
})

const toggleSubmenu = (tagId: string) => {
  dropdownRef.value?.show()
  activeSubmenu.value = activeSubmenu.value === tagId ? null : tagId
}

const closeSubmenu = () => {
  activeSubmenu.value = null
}

const onDragEnd = () => {
  isDragging.value = false
  dropdownRef.value?.show()
}

onMounted(() => {
  if (dropdownRef.value?.$el) {
    dropdownRef.value.$el.querySelectorAll('.tag-submenu').forEach((submenu: Element) => {
      submenu.addEventListener('mousedown', (event) => {
        event.preventDefault()
      })
    })
  }
})
</script>

<style scoped lang="scss">
@use "../../styles/variables";

.drag-handle {
  cursor: move;
}

.tag-submenu {
  min-width: 16rem;
}

.submenu-indicator-wrapper {
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: variables.$dark-secondary;
}

.submenu-indicator {
  display: inline-block;
  margin-left: 8px;
  color: variables.$dark-secondary;
}
</style>
