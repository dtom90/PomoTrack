<template>
  <b-modal
    id="dataModal"
    title="Data"
    size="lg"
    scrollable
    ok-only
  >
    <pre>{{ $root.$store.state }}</pre>
  </b-modal>
</template>

<style>
/*noinspection CssUnusedSymbol*/
#dataModal .modal-body {
  max-height: 70vh;
}
</style>
