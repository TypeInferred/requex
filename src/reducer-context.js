import {VALUE} from './reducers/storage-keys.js';
import Option from './option.js';

/**
 * <b>INTERNAL</b>
 * Provides context for executing reducers so they can store and retrieve state.
 */
export default class ReducerContext {
  /**
   * Constructs a context used to by a tree of reducers.
   * @param {Object} - The previous auxillary state used to retrieve stored values.
   * @param {Array<Event>} - The events to reduce.
   */
  constructor(previousAuxillary, eventMaybe) {
    /**
     * This is the current level of scope. I.e., the route from the root to the current reducer.
     * @type {Array<string>}
     */
    this._route = [];
    /**
     * This is the previous auxillary state used to retrieve stored values.
     * @type {Object}
     */
    this._previousAuxillary = previousAuxillary || {};
    
    /**
     * This contains the auxillary state built up in a reduction pass. For example, this
     * may include accumulator values for folds that cannot easily be derived from looking 
     * at the previous state.
     * 
     * @type {Object}
     *
     * @example <caption>Illustration where previous state isn't the same as the accumulator</caption>
     * From.events().ofAnyType().select(_ => 1).sum(0).select(x => 2 * x)
     */
    this.nextAuxillary = {};

    this._event = eventMaybe;
  }

  /**
   * Returns an option wrapping the event being processed or none if there is none or it is out of scope.
   * @return {Option<Event>} The event or none
   */
  getEvent() {
    return this._event;
  }

  /**
   * Reduces the value of a child reducer and uses the storage key provided to address it in auxillary state.
   * @param  {string} storageKey - The address to use for the child in auxillary state
   * @param  {Reducer} reducer - The child reducer
   * @return {Option<T>} The value if any produced in this context by the child reducer  
   */
  getValue(storageKey, reducer) {
    return this._reduce(storageKey, reducer);
  }

  /**
   * Reduces the value of a child reducer and uses the storage key provided to address it in auxillary state.
   * Doesn't use previous auxillary state to derive the value (i.e., it is "fresh").
   * @param  {string} storageKey - The address to use for the child in auxillary state
   * @param  {Reducer} reducer - The child reducer
   * @return {Option<T>} The value if any produced in this context by the child reducer  
   */
  getFreshValue(storageKey, reducer) {
    return this._reduce(storageKey, reducer, true);
  }

  /**
   * Stores a value in auxillary storage under the storage key.
   * @param  {string} storageKey - The address to use to access the value in auxillary state.
   * @param  value - The <i>serializable</i> value to store.
   */
  storeValue(storageKey, value) {
    this.nextAuxillary[storageKey] = [value];
  }

  /**
   * Retrieves a value stored in the previous auxillary storage on the last reduction.
   * @param  {string} storageKey - The address to use to access the value in auxillary state.
   * @return {Option} The value option
   */
  getStoredValue(storageKey) {
    if (this._previousAuxillary && 
        this._previousAuxillary[storageKey] &&
        this._previousAuxillary[storageKey].length)
    {
      return Option.some(this._previousAuxillary[storageKey][0]);
    }
    return Option.none();
  }

  /**
   * Returns the last value reduced by the current reducer if no storage key is provided otherwise that of
   * the child with the address given by the storage key. Looks up this value in auxillary state.
   * @param  {?string} storageKey - The address of the child or omitted for own value.
   * @return {T} The last value reduced by the reducer
   */
  getPreviousReduction(storageKey = null) {
    let previousEntry;
    if (storageKey) {
      previousEntry = 
        this._previousAuxillary && 
        this._previousAuxillary[storageKey] && 
        this._previousAuxillary[storageKey][VALUE];
    } else {
      previousEntry = this._previousAuxillary && this._previousAuxillary[VALUE];
    }
    return previousEntry && previousEntry.length ? Option.some(previousEntry[0]) : Option.none();
  }

  /**
   * Scopes the context within the action callback to only hold events matching the predicate.
   * @param  {function(e:Event):boolean} predicate - The filter over the events
   * @param  {function():T} action - The callback
   * @return {T} the value produced by the callback
   */
  scopedBy(predicate, action) {
    const isEventInScope = this._event.reduce((_, e) => predicate(e), true);
    let result;
    if (isEventInScope) {
      result = action(); 
    } else {
      // TODO: could optimise this when we already have a value and aren't seeding by copying the existing state.
      const event = this._event;
      this._event = Option.none();
      result = action();
      this._event = event;
    }
    return result;
  }

  _reduce(storageKey, reducer, shouldUseFreshState = false) {
    const parentNextAux = this.nextAuxillary;
    const parentPrevAux = this._previousAuxillary;
    this.nextAuxillary = parentNextAux[storageKey] || (parentNextAux[storageKey] = {});
    this._previousAuxillary = !shouldUseFreshState && this._previousAuxillary && this._previousAuxillary[storageKey];
    const newValue = reducer.reduce(this);
    // TODO: Should protect against this being something non-serializable. I.e., a function or a reducer!
    if (newValue.isSome) {
      this.nextAuxillary[VALUE] = [newValue.get()];
    } else if (this._previousAuxillary && this._previousAuxillary[VALUE] && this._previousAuxillary[VALUE].length) {
      this.nextAuxillary[VALUE] = this._previousAuxillary[VALUE];
    }
    this.nextAuxillary = parentNextAux;
    this._previousAuxillary = parentPrevAux;
    return newValue;
  }
}