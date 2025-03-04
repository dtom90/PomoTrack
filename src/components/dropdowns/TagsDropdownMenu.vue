<template>
  <b-nav-item-dropdown
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
          @click.native.stop="toggleSubmenu(tagId)"
        >
          <div class="d-flex justify-content-between align-items-center w-100">
            <img
              src="/icons/dots-6-vertical.svg"
              alt="Add interval"
              class="drag-handle"
            >
            <TagButton
              :tag="tags[tagId]"
              :tag-id="tagId"
              class="ml-3"
            />
            <font-awesome-icon
              icon="chevron-right"
              class="submenu-indicator"
            />
          </div>
        </b-dropdown-item>
          
        <!-- Submenu -->
        <div
          class="tag-submenu"
          :class="{ 'active': activeSubmenu === tagId }"
        >
          <!-- Tag Edit Form -->
          <b-dropdown-form @submit.prevent="updateTagSubmit(tagId)">
            <b-input-group>
              <b-form-input
                id="tag-name-input"
                ref="tagNameInput"
                v-model="newTagName"
                title="Rename tag"
                :style="`backgroundColor: ${newTagColor}`"
              />
            </b-input-group>
          </b-dropdown-form>
            
          <div class="dropdown-divider" />
            
          <sketch-picker
            v-model="newTagColor"
            class="color-picker"
            @input="newTagColor = $event.hex"
          />
            
          <div class="dropdown-divider" />
            
          <b-button
            variant="primary"
            class="w-100"
            @click="updateTagSubmit(tagId)"
          >
            Confirm
          </b-button>
            
          <br><br>
            
          <b-button
            :id="`delete-tag-btn-${tagId}`"
            title="Delete tag"
            variant="danger"
            class="w-100"
            @click="deleteTag({ tagId })"
          >
            Delete
          </b-button>
        </div>
      </div>
    </draggable>
    
    <b-dropdown-divider v-if="tagOrder.length > 0" />
    <b-dropdown-item
      disabled
      @click="createNewTag"
    >
      <div class="d-flex justify-content-between align-items-center w-100">
        Create New Tag
        <font-awesome-icon
          icon="chevron-right"
          class="submenu-indicator"
        />
      </div>
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
import TagButton from '../TagButton'
import Sketch from 'vue-color/src/components/Sketch'
import { mapGetters, mapActions, mapState } from 'vuex'
import draggable from 'vuedraggable'

export default {
  name: 'TagsDropdownMenu',
  
  components: {
    TagButton,
    'sketch-picker': Sketch,
    draggable
  },
  
  data () {
    return {
      activeSubmenu: null,
      tagEdits: {},
      newTagName: '',
      newTagColor: '#FFFFFF',
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
          // Initialize edit form with current values
          this.newTagName = tag.tagName
          this.newTagColor = tag.color
        }
      }
    }
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
    
    async updateTagSubmit (tagId) {
      await this.updateTag({
        tagId: tagId,
        tagName: this.newTagName,
        color: this.newTagColor
      })
      this.closeSubmenu()
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

.tag-dropdown-item {
  padding-right: 2rem;
}

.submenu-indicator {
  position: absolute;
  right: 1rem;
  font-size: 0.8rem;
  opacity: 0.7;
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
  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
  z-index: 1000;
}

.tag-submenu.active {
  display: block;
}

.color-picker {
  width: 100% !important;
  box-sizing: border-box;
}

#tag-name-input {
  color: white;
}
</style>

<style>
.dropdown-item {
  padding-left: 4px !important;
  padding-right: 4px !important;
}
</style>
