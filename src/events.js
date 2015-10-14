import AnyEventReducer from './reducers/any-event-reducer.js';
import EventReducer from './reducers/event-reducer.js';
import ReducerBuilder from './reducer-builder.js';

/**
 * A factory for creating reducer queries over the events in scope.
 */
export default class Events {
  /**
   * Creates a reducer query over events in scope matching the event type specified.
   * @param {string} eventType - The event type
   * @returns {ReducerBuilder} The query over the matching events
   */
  ofType(eventType) {
    return new ReducerBuilder(new EventReducer(eventType));
  }

  /**
   * Creates a reducer query of over all events in scope.
   * @returns {ReducerBuilder} The query over the events in scope
   */
   ofAnyType() {
    return new ReducerBuilder(new AnyEventReducer());
   }
}