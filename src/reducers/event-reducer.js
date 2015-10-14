import Reducer from './reducer.js';
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
  getNext(context) {
    return context.events.filter(([eventNumber, e]) => e.type === this._eventType);
  }
}