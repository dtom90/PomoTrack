import '../styles/main.scss'

import 'bootstrap/js/src/collapse'
import 'bootstrap/js/src/dropdown'
import 'bootstrap/js/src/modal'

import {
  NavPlugin,
  NavbarPlugin,
  LinkPlugin,
  BadgePlugin,
  ButtonPlugin,
  InputGroupPlugin,
  FormPlugin,
  FormGroupPlugin,
  FormRadioPlugin,
  FormInputPlugin,
  FormTextareaPlugin,
  FormCheckboxPlugin,
  DropdownPlugin,
  ModalPlugin,
  SidebarPlugin,
  TooltipPlugin
} from 'bootstrap-vue'
import Vue from 'vue'

Vue.use(NavPlugin)
Vue.use(NavbarPlugin)
Vue.use(LinkPlugin)
Vue.use(BadgePlugin)
Vue.use(ButtonPlugin)
Vue.use(InputGroupPlugin)
Vue.use(FormPlugin)
Vue.use(FormGroupPlugin)
Vue.use(FormRadioPlugin)
Vue.use(FormInputPlugin)
Vue.use(FormTextareaPlugin)
Vue.use(FormCheckboxPlugin)
Vue.use(DropdownPlugin)
Vue.use(ModalPlugin)
Vue.use(SidebarPlugin)
Vue.use(TooltipPlugin)
