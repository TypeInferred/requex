import Reducer from './reducer.js';
import Option from '../option.js';
import LinkedList from '../linked-list.js';
import {ADDITION_SOURCE, REMOVAL_SOURCE, ARGS_PREFIX} from './storage-keys.js';

const asArray = itemOrArray =>
  itemOrArray instanceof Array ? itemOrArray : [itemOrArray];

/**
 * <b>INTERNAL</b>
 * A reducer of linked lists that may itself contain reducers.
 */
export default class LinkedListReducer extends Reducer {

  constructor(additionSource, removalSource, elementSelector, keySelector) {
    super();
    this._additionSource = additionSource;
    this._removalSource = removalSource;
    this._keySelector = keySelector;
    this._elementSelector = elementSelector;
  }

  /** @ignore */
  reduce(context) {
    const previous = context.getPreviousReduction();
    const removals = context.getValue(REMOVAL_SOURCE, this._removalSource);
    const additions = context.getValue(ADDITION_SOURCE, this._additionSource);
    let hasChanged = previous.isNone;

    const existingItems = previous.otherwise(LinkedList.nil());
    let items = existingItems;

    // REMOVE
    if (removals.isSome) {
      hasChanged = true;
      const removedKeys = asArray(removals.get());
      items = LinkedList.filter(items, x => {
        const key = this._keySelector(x);
        return !removedKeys.includes(key);
      });
    }

    // UPDATE REMAINING
    items = LinkedList.map(items, x => {
      const key = this._keySelector(x);
      const reducerArgs = context.getStoredValue(ARGS_PREFIX + key);
      context.storeValue(ARGS_PREFIX + key, reducerArgs); // Keep for next time.
      const reducer = this._elementSelector(reducerArgs);
      let newValue = x;
      // If it is a reducer we reduce the new value.
      if (reducer.unwrap) {
        const reducedValue = context.getValue(key, reducer.unwrap());
        hasChanged = hasChanged || reducedValue.isSome;
        newValue = reducedValue.otherwise(x);
      }
      return newValue;
    });

    // ADD + SEED NEW
    if (additions.isSome) {
      hasChanged = true;
      items = asArray(additions.get()).reduceRight((acc, reducerArgs) => {
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
        return LinkedList.cons(value, acc);
      }, items);
    }

    return hasChanged ? Option.some(items) : Option.none();
  }
}