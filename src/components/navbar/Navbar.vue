<template>
  <BNavbar toggleable="md" variant="light">
    <BNavbarBrand href="#">
      Pomodash
    </BNavbarBrand>

    <div id="time-container">
      <span>{{ displayTime }}</span>
    </div>

    <div class="navbar-menu d-flex flex-column align-items-end">
      <BNavbarToggle target="nav-offcanvas-responsive" />
      <BOffcanvas
        id="nav-offcanvas-responsive"
        title="Menu"
        placement="end"
        responsive="md"
        aria-labelledby="nav-offcanvas-responsive-label"
      >
        <BOffcanvasHeader class="d-md-none">
          <BOffcanvasTitle id="nav-offcanvas-responsive-label">Menu</BOffcanvasTitle>
        </BOffcanvasHeader>
        <BOffcanvasBody>
          <BNavbarNav class="ms-auto">
            <NavbarTagsDropdown />

            <NavbarArchiveDropdown />

            <BNavItem @click="openAllActivity">
              <span>
                All Activity
              </span>
            </BNavItem>

            <NavbarOptionsDropdown />
          </BNavbarNav>
        </BOffcanvasBody>
      </BOffcanvas>
    </div>
  </BNavbar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import dayjs from 'dayjs'
import type { Settings } from '@/types'
import NavbarTagsDropdown from './NavbarTagsDropdown.vue'
import NavbarArchiveDropdown from './NavbarArchiveDropdown.vue'
import NavbarOptionsDropdown from './NavbarOptionsDropdown.vue'

const store = useStore()

// State
const currentDate = ref<Date | null>(null)
const settings = computed<Settings>(() => store.state.settings)
let intervalId: number | undefined

// Computed
const displayTime = computed(() => {
  if (!currentDate.value) {
    return ''
  }
  const timeFormat = settings.value?.timeFormat24 ? 'H:mm' : 'h:mm A'
  return dayjs(currentDate.value).format(timeFormat)
})

// Methods
const updateTime = () => {
  currentDate.value = new Date()
}

const openAllActivity = () => {
  store.commit('updateTempState', { key: 'modalTagId', value: null })
  store.dispatch('openActivityModal')
}

// Lifecycle Hooks
onMounted(() => {
  updateTime()
  intervalId = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
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
