import hamt from 'hamt';
import {merge} from './hamt-utils.js';
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
   * @param {HAMT<string>} [handledEventTypes=null] - The handled event types (or an over-estimate)
   * @returns {ReducerBuilder} - The reducer query containing the value
   */
  static value(value, handledEventTypes = null) {
    return new ReducerBuilder(({next}) => next(value), handledEventTypes || hamt.empty)
  }

  /**
   * Builds a a reducer query from a structure of reducer queries and constants representing
   * the reduced structure.
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static structure(reducerStructure) {
    if (typeof reducerStructure !== 'object') throw new Error('Invalid reducerStructure argument. Expected an object.');
    const keys = Object.keys(reducerStructure);
    const constantProperties = keys
      .filter(k => !(reducerStructure[k] instanceof ReducerBuilder))
      .reduce((acc, k) => {
        acc[k] = reducerStructure[k];
        return acc;
      }, {});
    const reducerProperties = keys
      .filter(k => reducerStructure[k] instanceof ReducerBuilder)
      .reduce((acc, k) => hamt.set(k, reducerStructure[k].build(), acc), hamt.empty);
    const handledEventTypes = merge(hamt.values(reducerProperties).map(reducerProperty => reducerProperty.handledEventTypes));
    return From.value({constantProperties, reducerProperties}, handledEventTypes).lift(); 
  }
}