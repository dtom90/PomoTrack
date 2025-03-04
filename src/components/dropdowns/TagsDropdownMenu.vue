<template>
  <div>
    <b-dropdown-item
      v-for="tag in sortedTagList"
      :key="tag.id"
    >
      <TagButton
        :tag="tag"
        :tag-id="tag.id"
      />
    </b-dropdown-item>
    <b-dropdown-divider v-if="sortedTagList.length > 0" />
    <b-dropdown-item>
      <font-awesome-icon icon="plus" />
      Create New Tag
    </b-dropdown-item>
    <b-dropdown-item>
      <font-awesome-icon icon="gear" />
      Manage Tags
    </b-dropdown-item>
  </div>
</template>

<script>
import TagButton from '../TagButton'
import { mapGetters } from 'vuex'

export default {
  name: 'TagsDropdownMenu',
  
  components: {
    TagButton
  },
  
  computed: {
    ...mapGetters([
      'sortedTagList'
    ])
  },
  
  methods: {
  }
}
</script>

<style scoped>

</style>
