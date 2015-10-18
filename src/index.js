import ReducerBuilder from './reducer-builder.js';
import ValueReducer from './reducers/value-reducer.js';
import EventReducer from './reducers/event-reducer.js';
import AnyEventReducer from './reducers/any-event-reducer.js';
import StructureReducer from './reducers/structure-reducer.js';
import LinkedListReducer from './reducers/linked-list-reducer.js';
import NeverReducer from './reducers/never-reducer.js';
import _Option from './option.js';
import _LinkedList from './linked-list.js';

/**
 * Represents an optional type, i.e., some value or none.
 * @type {Option<T>}
 */
export const Option = _Option;

/**
 * Represents a linked-list
 * @type {LinkedList<T>}
 */
export const LinkedList = _LinkedList;

/**
 * A factory for creating reducer queries.
 */
export default class Reduce {
  /**
   * Creates a reducer query over events in scope matching the event type specified.
   * @param {string} eventType - The event type
   * @returns {ReducerBuilder} The query over the matching events
   */
  static eventsOfType(eventType) {
    return new ReducerBuilder(new EventReducer(eventType));
  }

  /**
   * Creates a reducer query of over all events in scope.
   * @returns {ReducerBuilder} The query over the events in scope
   */
  static allEvents() {
    return new ReducerBuilder(new AnyEventReducer());
  }

  /**
   * A reducer query returning the value provided.
   * @param value - The value
   * @returns {ReducerBuilder} - The reducer query containing the value
   */
  static value(value) {
    return new ReducerBuilder(new ValueReducer(value));
  }

  /**
   * Builds a a reducer query from a structure of reducer queries and constants representing
   * the reduced structure.
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static structure(reducerStructure) {
    return new ReducerBuilder(new StructureReducer(reducerStructure));
  }

  static linkedListOf({additions, removals, itemFactory, itemKey}) {
    return new ReducerBuilder(new LinkedListReducer(additions.unwrap(), removals.unwrap(), itemFactory, itemKey));
  }

  /**
   * A reducer query that never produces any updates in state.
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static never() {
    return new ReducerBuilder(new NeverReducer());
  }
}