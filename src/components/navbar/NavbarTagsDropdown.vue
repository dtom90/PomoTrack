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
        class="tag-item-wrapper"
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
            <div class="flex-1" @click.stop="toggleSubmenu(tagId)">
              <TagButton
                :tag="tags[tagId]"
                :tag-id="tagId"
                class="ml-3"
              />
            </div>
            <div class="submenu-indicator-wrapper" @click.stop="toggleSubmenu(tagId)">
              <font-awesome-icon
                icon="chevron-right"
                class="submenu-indicator"
              />
            </div>
          </div>
        </b-dropdown-item>
        
        <!-- Submenu -->
        <div
          class="tag-submenu submenu"
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
import { mapGetters, mapActions, mapState } from 'vuex'
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
    ...mapGetters([
      'sortedTagList'
    ]),
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

<style scoped>
.tag-item-wrapper {
  position: relative;
}

.drag-handle {
  cursor: move;
}

.tag-submenu {
  position: absolute;
  top: 0;
  left: 100%;
  display: none;
  min-width: 16rem;
  padding: 0.5rem;
  margin: 0;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
  z-index: 1000;
}

.tag-submenu.active {
  display: block;
}

.submenu-indicator-wrapper {
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
