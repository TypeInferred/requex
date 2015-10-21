import ReducerContext from './reducer-context.js';
import {ROOT} from './reducers/storage-keys.js';
import Option from './option.js';

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
    const hasSeeded = context && context.previousAuxillary && true;
    const eventsMaybe = 
      events.length 
      ? events.map(Option.some) 
      : hasSeeded
        ? []
        : [Option.none()];
    console.log('test');
    const output = eventsMaybe.reduce((acc, e) => {
      const internalContext = new ReducerContext(acc.auxillary, e);
      const updateMaybe = internalContext.getValue(ROOT, this._reducer);
      const update = updateMaybe.isSome ? updateMaybe : acc.update;
      return {auxillary: internalContext.nextAuxillary, update};
    }, {auxillary: context && context.previousAuxillary, update: Option.none()});

    const newAuxillary = output.auxillary;
    const newState = output.update.otherwise(context && context.previousState);
    return {newState, newAuxillary};
  }

  /**
   * Returns a store.
   * @param  {?NewState} previousState - The last produced state by another store if any.
   * @return {Object} A store
   * @property {function(e:Event)} dispatch - Dispatches an event into the store to update the state.
   * @property {function():T} getState - Returns the current state.
   */
  toStore(previousState) {
    let state = previousState || this.reduce();
    return {
      dispatch: event => state = this.reduce({previousAuxillary: state.newAuxillary, previousState: state.newState, event}),
      getState: () => state.newState,
      replaceReducer: reducerQuery => reducerQuery.toStore(state)
    };
  }
}