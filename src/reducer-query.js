import ReducerContext from './reducer-context.js';

/**
 * An entry-point to a tree of reducers forming a reducer query. Provides convenience methods for reducing events.
 */
export default class ReducerQuery {
  /**
   * <b>INTERNAL</b>
   * Constructs a reducer query from a reducer.
   * @param {Reducer} - The root reducer to wrap.
   * @access internal
   */
  constructor(reducer) {
    this._reducer = reducer;
    this._eventIndex = 0;
  }

  /**
   * @typedef {Object} PreviousState
   * @property {Object} previousState - The last produced state.
   * @property {Object} previousAuxillary - The last auxillary state that contains accumulator values etc.
   * @property {?Array<Event>} events - The events to reduce (should only set one of `events` or `event` but not both)
   * @property {?Event} events - The event to reduce (should only set one of `events` or `event` but not both)
   */
  
  /**
   * @typedef {Object} NewState
   * @property {Object} newState - The newly produced state or the previous state if unchanged.
   * @property {Object} newAuxillary - The newly produced auxillary state that contains accumulator values etc.
   */

  /**
   * Reduces new events and the previous state into a new state.
   * @param  {?PreviousState} context - The last produced state if any.
   * @return {NewState} - The newly produced state.
   */
  reduce(context) {
    const events = context && (context.events || [context.event]) || [];
    const numberedEvents = events.map(e => [this._eventIndex++, e]);
    const internalContext = new ReducerContext(context && context.previousAuxillary, numberedEvents);
    const updates = this._reducer.getNext(internalContext);
    const newState = updates.length ? updates[updates.length - 1][1] : (context && context.previousState);
    const newAuxillary = internalContext.nextAuxillary;
    return {newState, newAuxillary};
  }
}