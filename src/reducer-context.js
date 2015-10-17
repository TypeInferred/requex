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

  getEvent() {
    return this._event;
  }

  getValue(storageKey, reducer) {
    return this._reduce(storageKey, reducer);
  }

  getFreshValue(storageKey, reducer) {
    return this._reduce(storageKey, reducer, true);
  }

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

  scopedBy(predicate, action) {
    const isEventInScope = this._event.reduce((_, e) => predicate(e), true);
    let result;
    if (isEventInScope) {
      result = action(); 
    } else {
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