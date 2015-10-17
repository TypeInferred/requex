import Reducer from './reducer.js';
import Option from '../option.js';

/**
 * <b>INTERNAL</b>
 * Yields any matching events in the context.
 */
export default class EventReducer extends Reducer {
  /**
   * Constructs a reducer that yields for the given event type.
   * @param {string} eventType - The event type to filter on.
   */
  constructor(eventType) {
    super();
    this._eventType = eventType;
  }

  /** @ignore */
  reduce(context) {
    return context.getEvent().filter(event => this._eventType === event.type);
  }
}