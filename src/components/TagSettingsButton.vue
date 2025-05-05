<template>
  <BDropdown
    v-if="tag"
    ref="dropdown"
    class="tag"
    :text="tag.tagName"
    placement="right-start"
    @show="handleDropdownShow"
  >
    <TagEditMenu
      ref="tagEditMenu"
      :tag-id="tagId"
      @update-tag="handleDropdownHide"
    />
  </BDropdown>
</template>

<script>
import TagEditMenu from './TagEditMenu.vue'
import { mapActions, mapState } from 'vuex'
import getTextColor from '../lib/getTextColor'
export default {
  name: 'TagSettingsButton',

  components: {
    TagEditMenu
  },

  props: {
    tagId: {
      type: String,
      default: null
    }
  },

  computed: {
    ...mapState([
      'tags'
    ]),
    tag: function () {
      return this.tags[this.tagId]
    }
  },

  mounted () {
    if (this.tag) {
      this.setButtonColor()
    }
  },

  methods: {
    ...mapActions([
      'updateTag',
      'deleteTag'
    ]),

    setButtonColor () {
      this.$el.querySelector('.dropdown-toggle').style.setProperty('background-color', this.tag.color)
      this.$el.querySelector('.dropdown-toggle').style.setProperty('color', getTextColor(this.tag.color))
    },

    handleDropdownShow () {
      if (!this.tag) {
        return
      }
      this.$refs.tagEditMenu.refreshTagNameAndColor()
    },

    handleDropdownHide () {
      this.setButtonColor()
      this.$refs.dropdown.hide()
    }
  }
}
</script>

<style lang="scss">

</style>
