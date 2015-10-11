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
    return new ReducerBuilder((previousState, event) => next => next(value), hamt.empty)
  }

  /**
   * Builds a a reducer query from a structure of reducer queries and constants representing
   * the reduced structure.
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static structure(reducerStructure) {
    if (typeof reducerStructure !== 'object') throw new Error('Invalid reducerStructure argument. Expected an object.');
    const keys = Object.keys(reducerStructure);
    const constantKeys = keys.filter(k => !(reducerStructure[k] instanceof ReducerBuilder));
    const reducerKeys = keys.filter(k => reducerStructure[k] instanceof ReducerBuilder);
    const reducerLookup = reducerKeys.reduce((acc, k) => hamt.set(k, reducerStructure[k].build(), acc), hamt.empty);
    const handledEventTypes = hamt.values(reducerLookup).reduce((acc, reducerProperty) => {
      const reducerPropertyHandledEvents = hamt.keys(reducerProperty.handledEventTypes);
      return reducerPropertyHandledEvents.reduce((innerAcc, eventType) => hamt.set(eventType, true, innerAcc), acc);
    }, hamt.empty);
    return new ReducerBuilder((previousState, event) => next => {
      // Track whether the state has actually changed. If not, we can return the previous state.
      const isSeeding = previousState === undefined;
      let hasStateChanged = isSeeding;
      const nextState = {};
      // Reduce reducer properties using previous state and the event
      reducerKeys.forEach(k => {
        const previousPropertyValue = previousState && previousState[k];
        const propertyReducer = hamt.get(k, reducerLookup);
        // Property can change on initial seed or if the reducer can handle the event.
        const couldPropertyChange = isSeeding || hamt.get(event, propertyReducer.handledEventTypes);
        if (couldPropertyChange) {
          const newPropertyValue = propertyReducer.reduce(previousState, event);
          // If it has changed we take the new value and will produce a new version of the state.
          if (newPropertyValue !== previousPropertyValue) {
            hasStateChanged = true;
            nextState[k] = newPropertyValue;
            return;
          }
        }
        nextState[k] = previousPropertyValue;
      });
      if (hasStateChanged) {
        // Copy constants
        constantKeys.forEach(k => nextState[k] = reducerStructure[k]);
        next(nextState);
        return;
      }
      next(previousState);
    }, handledEventTypes)
  }
}