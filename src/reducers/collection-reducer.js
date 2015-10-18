import Reducer from './reducer.js';
import Option from '../option.js';
import NeverReducer from './never-reducer.js';
import {ADDITION_SOURCE, REMOVAL_SOURCE, ARGS_PREFIX} from './storage-keys.js';

/**
 * Returns the single object wrapped in an array or the array if the argument is an array.
 * @param {T|Array<T>} itemOrArray - The item or array of items
 * @return {Array<T>} An array of items
 */
const asArray = itemOrArray =>
  itemOrArray instanceof Array ? itemOrArray : [itemOrArray];

/**
 * <b>INTERNAL</b>
 * A reducer of a collection that may itself contain reducers.
 */
export default class CollectionReducer extends Reducer {

  /**
   * Builds a reducer that creates of a collection from a reducer for additions, a reducer for removals, a function to construct
   * items and a function to extract the key from a constructed item. Keys are used for removal and addressing the auxillary
   * state to ensure accumulators are seeded correctly etc.
   * @param  {CollectionConfiguration} configuration - the configuration needed to build the collection
   */
  constructor(collectionApi, configuration) {
    super();
    const {additions, itemFactory, itemKey} = configuration;
    const removals = configuration.removals && configuration.removals.unwrap() || new NeverReducer();
    this._additionSource = additions.unwrap();
    this._removalSource = removals;
    this._keySelector = itemKey;
    this._elementSelector = itemFactory;
    this._collectionApi = collectionApi;
  }

  /** @ignore */
  reduce(context) {
    const previous = context.getPreviousReduction();
    let hasChanged = previous.isNone;
    let changeTracker = { hasChanged: previous.isNone };
    const existingItems = previous.otherwise(this._collectionApi.empty());
    let items = this._collectionApi.prepare(existingItems);
    // REMOVE
    items = this._filterRemovals(context, items, changeTracker)
    // UPDATE REMAINING
    items = this._updateRemaining(context, items, changeTracker);
    // ADD + SEED NEW
    items = this._consAdditions(context, items, changeTracker);
    return changeTracker.hasChanged ? Option.some(items) : Option.none();
  }

  _filterRemovals(context, items, changeTracker) {
    const removals = context.getValue(REMOVAL_SOURCE, this._removalSource);
    if (removals.isSome) {
      changeTracker.hasChanged = true;
      const removedKeys = asArray(removals.get());
      return this._collectionApi.filter(items, x => {
        const key = this._keySelector(x);
        return !removedKeys.includes(key);
      });
    }
    return items;
  }

  _updateRemaining(context, items, changeTracker) {
    return this._collectionApi.map(items, x => {
      const key = this._keySelector(x);
      const reducerArgs = context.getStoredValue(ARGS_PREFIX + key);
      context.storeValue(ARGS_PREFIX + key, reducerArgs); // Keep for next time.
      const reducer = this._elementSelector(reducerArgs);
      let newValue = x;
      // If it is a reducer we reduce the new value.
      if (reducer.unwrap) {
        const reducedValue = context.getValue(key, reducer.unwrap());
        changeTracker.hasChanged = changeTracker.hasChanged || reducedValue.isSome;
        newValue = reducedValue.otherwise(x);
      }
      return newValue;
    });
  }

  _consAdditions(context, items, changeTracker) {
    const additions = context.getValue(ADDITION_SOURCE, this._additionSource);
    if (additions.isSome) {
      changeTracker.hasChanged = true;
      return asArray(additions.get()).reduce((acc, reducerArgs) => {
        const reducerOrValue = this._elementSelector(reducerArgs);
        let value;
        let key; 
        if (reducerOrValue.unwrap) {
          const reducedValue = context.getFreshValue('temp', reducerOrValue.unwrap());
          value = reducedValue.get();
          key = this._keySelector(value);
          // Move storage to under actual key. TODO: refactor this.
          context.getValue(key, {reduce: () => reducedValue});
        } else {
          value = reducerOrValue;
          key = this._keySelector(value);
        }
        context.storeValue(ARGS_PREFIX + key, reducerArgs); // Keep for next time.
        return this._collectionApi.put(acc, key, value);
      }, items);
    }
    return items;
  }
}