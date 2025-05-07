import Vuex from 'vuex'
import config from './config.ts'

export default new Vuex.Store(config)

const initialState = config.state
const mutations = config.mutations
const actions = config.actions

export { initialState, mutations, actions }
