<template>
  <b-nav-item-dropdown
    id="navbarTagsDropdown"
    ref="dropdown"
    text="Tags"
    no-caret
    boundary="viewport"
    right
  >
    <template #button-content>
      <span>Tags</span>
    </template>
    
    <draggable
      v-model="tagOrder"
      ghost-class="draggable-ghost"
      :animation="200"
      @start="isDragging = true"
      @end="onDragEnd"
    >
      <div
        v-for="tagId in tagOrder"
        :key="tagId"
        class="submenu-button-wrapper"
      >
        <b-dropdown-item
          class="tag-dropdown-item"
        >
          <div class="d-flex justify-content-between align-items-center w-100">
            <img
              src="/icons/dots-6-vertical.svg"
              alt="Add interval"
              class="drag-handle"
            >
            <div
              class="flex-1"
              @click.stop="toggleSubmenu(tagId)"
            >
              <TagButton
                :tag="tags[tagId]"
                :tag-id="tagId"
                class="ml-3"
              />
            </div>
            <div
              class="submenu-indicator-wrapper"
              @click.stop="toggleSubmenu(tagId)"
            >
              <font-awesome-icon
                icon="chevron-right"
                class="submenu-indicator"
              />
            </div>
          </div>
        </b-dropdown-item>
        
        <!-- Submenu -->
        <div
          class="submenu tag-submenu"
          :class="{ 'active': activeSubmenu === tagId }"
        >
          <TagEditMenu
            :ref="`tagEditMenu-${tagId}`"
            :tag-id="tagId"
            @update-tag="closeSubmenu"
          />
        </div>
      </div>
    </draggable>
  </b-nav-item-dropdown>
</template>

<script>
import TagButton from '../TagButton'
import TagEditMenu from '../TagEditMenu'
import { mapActions, mapState } from 'vuex'
import draggable from 'vuedraggable'

export default {
  name: 'NavbarTagsDropdown',
  
  components: {
    TagButton,
    TagEditMenu,
    draggable
  },
  
  data () {
    return {
      activeSubmenu: null,
      tagEdits: {},
      isDragging: false
    }
  },
  
  computed: {
    ...mapState([
      'tags'
    ]),
    tagOrder: {
      get () {
        return this.$store.state.tagOrder
      },
      set (newOrder) {
        this.reorderTags({ newOrder })
      }
    }
  },
  
  watch: {
    activeSubmenu (tagId) {
      if (tagId) {
        const tag = this.tags[tagId]
        if (tag) {
          this.$refs[`tagEditMenu-${tagId}`][0].refreshTagNameAndColor()
        }
      }
    }
  },

  mounted () {
    // Prevent clicking within the submenus from dragging the tag buttons
    this.$el.querySelectorAll('.tag-submenu').forEach(submenu => {
      submenu.addEventListener('mousedown', (event) => {
        event.preventDefault()
      })
    })
  },
  
  methods: {
    ...mapActions([
      'updateTag',
      'deleteTag',
      'reorderTags'
    ]),
    
    toggleSubmenu (tagId) {
      this.$refs.dropdown.show() // Keep dropdown open after submenu is toggled
      if (this.activeSubmenu === tagId) {
        this.activeSubmenu = null
      } else {
        this.activeSubmenu = tagId
      }
    },
    
    closeSubmenu () {
      this.activeSubmenu = null
    },
    
    createNewTag () {
      this.$emit('create-new-tag')
    },
    
    manageTags () {
      this.$emit('manage-tags')
    },
    
    onDragEnd () {
      this.isDragging = false
      this.$refs.dropdown.show() // Keep dropdown open after drag ends
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../styles/variables";

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
  color: $dark-secondary;
}
</style>
