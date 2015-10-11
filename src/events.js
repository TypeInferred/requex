import hamt from 'hamt';
import ReducerBuilder from './reducer-builder.js';
import {ALL_EVENT_TYPES} from './constants.js';

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
    if (typeof eventType !== 'string') throw new Error('Invalid eventType argument. Expected a string.');
    return new ReducerBuilder(
      (_, event) => next => event && event.type === eventType && next(event), 
      hamt.set(eventType, true, hamt.empty));
  }

  /**
   * Creates a reducer query of over all events in scope.
   * @returns {ReducerBuilder} The query over the events in scope
   */
   ofAnyType() {
    return new ReducerBuilder((_, event) => next => next(event), hamt.set('*', true, hamt.empty));
   }
}