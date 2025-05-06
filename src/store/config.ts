import initialState from './initialState'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'
import type { StoreOptions } from 'vuex';
import type { PomoTrackState } from '@/types';

const storeConfig: StoreOptions<PomoTrackState> = {
  state: initialState as PomoTrackState,
  getters,
  actions,
  mutations
}

export default storeConfig;
