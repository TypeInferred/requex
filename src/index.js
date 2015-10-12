import hamt from 'hamt';
import Events from './events.js';
import ReducerBuilder from './reducer-builder.js';
import * as Consts from './constants.js';

const events = new Events();

/**
 * Collection of constant values for event types etc.
 */
export const Constants = Consts;

/**
 * A factory for creating reducer queries.
 */
export default class From {
  /**
   * A sub-factory for creating reducer queries over the events in scope.
   * @returns {Events} The factory
   */
  static events() {
    return events;
  }

  /**
   * A reducer query returning the value provided.
   * @param value - The value
   * @returns {ReducerBuilder} - The reducer query containing the value
   */
  static value(value) {
    return new ReducerBuilder(({next}) => next(value), hamt.empty)
  }

  /**
   * Builds a a reducer query from a structure of reducer queries and constants representing
   * the reduced structure.
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static structure(reducerStructure) {
    return From.value(reducerStructure).lift(); 
  }
}