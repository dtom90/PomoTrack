<script>
export default {
  name: 'ModalTitle',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  }
}
</script>

<template>
  <div class="title-container">
    <font-awesome-icon
      :icon="icon"
      class="icon-align"
    />
    <span>{{ title }}</span>
  </div>
</template>

<style scoped>
.title-container {
  display: flex;
  align-items: center;
}

.icon-align {
  margin-right: 5px;
}
</style>
