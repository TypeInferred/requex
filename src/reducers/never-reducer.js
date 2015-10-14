import Reducer from './reducer';

/**
 * <b>INTERNAL</b>
 * Never yields
 */
export default class NeverReducer extends Reducer {
  /** ignore */
  getNextUpdates() {
    return [];
  }
}