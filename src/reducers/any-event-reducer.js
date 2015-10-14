import Reducer from './reducer.js';

/**
 * <b>INTERNAL</b>
 * Yields any events in the context.
 */
export default class AnyEventReducer extends Reducer {
  /** @ignore */
  getNextUpdates(context) {
    return context.events;
  }
}