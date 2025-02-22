<template>
  <b-modal
    id="tagModal"
    content-class="tag-modal-content"
    size="lg"
    scrollable
    ok-only
    @shown="isModalShown = true"
    @hidden="isModalShown = false"
  >
    <template v-slot:modal-title>
      <ModalTitle
        title="Tags"
        icon="tag"
      />
    </template>
    <draggable
      v-if="isModalShown"
      v-model="tagOrder"
      ghost-class="draggable-ghost"
      :animation="200"
      @start="isDragging = true"
      @end="isDragging = false"
    >
      <transition-group
        type="transition"
        :name="!isDragging ? 'flip-list' : ''"
      >
        <div
          v-for="tagId in tagOrder"
          :key="tagId"
          class="tag"
        >
          <div
            class="btn-group"
            role="group"
          >
            <div
              type="button"
              class="btn move-btn draggable-item"
              :style="`backgroundColor: ${tags[tagId].color}`"
            >
              <font-awesome-icon icon="bars" />
            </div>
            <TagSettingsButton :tag-id="tagId" />
          </div>
        </div>
      </transition-group>
    </draggable>
    <div id="menu-padding" />
  </b-modal>
</template>

<script>
import TagSettingsButton from '../TagSettingsButton'
import { mapActions, mapState } from 'vuex'
import draggable from 'vuedraggable'
import ModalTitle from './ModalTitle.vue'

export default {
  name: 'TagModal',
  
  components: {
    ModalTitle,
    TagSettingsButton,
    draggable
  },
  
  data: () => ({
    isModalShown: false,
    isDragging: false
  }),
  
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
  
  methods: {
    ...mapActions([
      'reorderTags'
    ])
  }
}
</script>

<style>
.tag-modal-content {
  overflow-y: scroll;
}
#menu-padding {
  height: 380px;
}
</style>

<style scoped lang="scss">

.tag {
  margin-bottom: 20px;
  
  //noinspection CssInvalidPropertyValue
  .move-btn {
    color: white;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.4),
    0 0 13px rgba(0, 0, 0, 0.1),
    0 0 23px rgba(0, 0, 0, 0.1);
  }
  
  .move-btn:hover {
    color: lightgrey;
  }
}

</style>
