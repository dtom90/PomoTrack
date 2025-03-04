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
        <b-navbar-nav class="ml-auto">
          <TagsDropdownMenu />
          <b-nav-item-dropdown
            text="Archive"
            no-caret
            boundary="viewport"
            right
          >
            <ArchiveDropdownMenu />
          </b-nav-item-dropdown>
          <b-nav-item v-b-modal.allActivityModal>
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
import time from '../lib/time'
import NavbarOptionsDropdown from './dropdowns/NavbarOptionsDropdown'
import TagsDropdownMenu from './dropdowns/TagsDropdownMenu'
import ArchiveDropdownMenu from './dropdowns/ArchiveDropdownMenu'
import { mapGetters } from 'vuex'

export default {
  name: 'Navbar',
  
  components: {
    NavbarOptionsDropdown,
    TagsDropdownMenu,
    ArchiveDropdownMenu
  },
  
  mixins: [time],
  
  data: function () {
    return {
      currentDate: null,
      currentMinute: null
    }
  },
  
  computed: {
    ...mapGetters([
      'sortedTagList'
    ]),
    
    displayTime () {
      return this.displayTimeHuman(this.currentDate)
    }
  },
  
  mounted () {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  },
  
  methods: {
    updateTime () {
      this.currentDate = new Date()
    }
  }
}
</script>

<style scoped lang="scss">
@import "../styles/_variables.scss";

.navbar-brand {
  z-index: 2;
  font-size: $font-size-base;
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
  font-size: $font-size-base;
}

// Ensure time display also uses the same font size
#time-container {
  font-size: $font-size-base;
}
</style>
