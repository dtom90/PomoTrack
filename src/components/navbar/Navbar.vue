<template>
  <nav class="navbar navbar-expand-md navbar-light bg-light">
    <b-navbar-brand href="#">
      PomoTrack
    </b-navbar-brand>

    <div id="time-container">
      <span>{{ displayTime }}</span>
    </div>

    <div class="navbar-menu d-flex flex-column align-items-end">
      <b-navbar-toggle target="nav-collapse" />
      <b-collapse
        id="nav-collapse"
        is-nav
      >
        <b-navbar-nav class="ms-auto">
          <NavbarTagsDropdown />

          <NavbarArchiveDropdown />

          <b-nav-item @click="openAllActivity">
            <span>
              All Activity
            </span>
          </b-nav-item>

          <NavbarOptionsDropdown />
        </b-navbar-nav>
      </b-collapse>
    </div>
  </nav>
</template>

<script>
import time from '../../lib/time'
import { mapMutations, mapActions } from 'vuex'
import NavbarTagsDropdown from './NavbarTagsDropdown.vue'
import NavbarArchiveDropdown from './NavbarArchiveDropdown.vue'
import NavbarOptionsDropdown from './NavbarOptionsDropdown.vue'

export default {
  name: 'Navbar',

  components: {
    NavbarArchiveDropdown,
    NavbarTagsDropdown,
    NavbarOptionsDropdown
  },

  mixins: [time],

  data: function () {
    return {
      currentDate: null,
      currentMinute: null
    }
  },

  computed: {

    displayTime () {
      return this.displayTimeHuman(this.currentDate)
    }
  },

  mounted () {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  },

  methods: {
    ...mapMutations([
      'updateTempState'
    ]),
    ...mapActions([
      'openActivityModal'
    ]),

    updateTime () {
      this.currentDate = new Date()
    },

    openAllActivity () {
      this.updateTempState({ key: 'modalTagId', value: null })
      this.openActivityModal()
    }
  }
}
</script>

<style scoped lang="scss">
@use "../../styles/variables";

.navbar-brand {
  z-index: 2;
  font-size: variables.$font-size-base;
}

.navbar-brand, .navbar-menu, .navbar-toggler {
  flex: 1;
}

.navbar-toggler {
  z-index: 2;
}

#navbarMenuOptions {
  z-index: 4;
}

// Add global font size for all elements in the navbar
nav {
  font-size: variables.$font-size-base;
}

// Ensure time display also uses the same font size
#time-container {
  font-size: variables.$font-size-base;
}

// Add padding to navbar items
::v-deep {
  .nav-link,
  .dropdown-toggle {
    padding: 4px 12px !important;
  }
}
</style>
