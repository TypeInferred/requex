import Reducer from './reducer.js';
import Option from '../option.js';
import NeverReducer from './never-reducer.js';
import MergeReducer from './merge-reducer.js';
import {ADDED, REMOVED, CLEARED} from '../collection-delta-kinds.js';
import {EXTRA, SOURCE} from './storage-keys.js';

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
   * Builds a reducer of a collection from an item factory and an array of reducers to supply deltas to the collection.
   * @param  {CollectionConfiguration} configuration - the configuration needed to build the collection
   */
  constructor(collectionApi, {itemFactory, deltas}) {
    super();
    this._itemFactory = itemFactory;
    this._deltas = new MergeReducer(deltas);
    this._collectionApi = collectionApi;
  }

  /** @ignore */
  reduce(context) {
    const previous = context.getPreviousReduction();
    const existingReducerArgs = context.getStoredValue(EXTRA).otherwise({});
    const deltas = context.getValue(SOURCE, this._deltas);
    if (deltas.isSome || previous.isSome) {
      const changeTracker = { hasChanged: false };
      const newReducerArgs = {};
      let items = previous.map(this._collectionApi.prepare).otherwise(this._collectionApi.empty());
      const newDeltas = Array.prototype.concat.apply([], deltas.otherwise([]));
      newDeltas.forEach(delta => {
        changeTracker.hasChanged = true;
        switch (delta.kind) {
          case ADDED: 
            this._added(context, items, newReducerArgs, delta.key, delta.value);
            break;
          case REMOVED: 
            this._collectionApi.remove(items, delta.key);
            break;
          case CLEARED: 
            items = this._collectionApi.empty();
            break;
          default: 
            throw new Error(`Delta kind argument out of range: ${delta.kind}`);
        }
      });
      this._collectionApi.forEach(items, (key, value) => 
        this._updated(context, items, changeTracker, existingReducerArgs, newReducerArgs, key));
      context.storeValue(EXTRA, newReducerArgs);
      if (changeTracker.hasChanged) {
        return Option.some(items);
      }
      return Option.none();
    }
    return Option.some(this._collectionApi.empty());
  }

  _added(context, items, newReducerArgs, key, args) {
    newReducerArgs[key] = args;
    let item = this._itemFactory(args);
    if (item.unwrap) {
      item = context.getFreshValue(key, item.unwrap()).otherwise(undefined);
    }
    this._collectionApi.put(items, key, item);
  }

  _updated(context, items, changeTracker, existingReducerArgs, newReducerArgs, key) {
    const args = existingReducerArgs[key]; // TODO: What about undefined as an argument? Should we allow that?
    if (args) {
      newReducerArgs[key] = args;
      const reducer = this._itemFactory(args);
      if (reducer.unwrap) {
        const item = context.getValue(key, reducer.unwrap());
        if (item.isSome) {
          changeTracker.hasChanged = true;
          this._collectionApi.put(items, key, item.get());
        }
      }
    }
  }
}