import Reducer from './reducer';
import Option from '../option.js';

/**
 * <b>INTERNAL</b>
 * Never yields
 */
export default class NeverReducer extends Reducer {
  /** @ignore */
  reduce() {
    return Option.none();
  }
}