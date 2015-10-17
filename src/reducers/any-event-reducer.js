import Reducer from './reducer.js';
import Option from '../option.js';

/**
 * <b>INTERNAL</b>
 * Yields any events in the context.
 */
export default class AnyEventReducer extends Reducer {
  /** @ignore */
  reduce(context) {
    return context.getEvent();
  }
}