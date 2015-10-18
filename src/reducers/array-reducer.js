import CollectionReducer from './collection-reducer.js';

/** @ignore */
const emptyArray = [];

/** @ignore */
const arrayApi = {
  prepare: xs => xs.slice(), // Copy so we can cheat in the put and just use push, TODO: Use mutation for remove and map too.
  empty: () => emptyArray,
  remove: (array, itemKey, removedKeys) => array.filter(x => {
    const key = itemKey(x);
    return !removedKeys.includes(key);
  }),
  map: (array, selector) => array.map(selector),
  put: (array, key, value) => {
    array.push(value);
    return array;
  }
};

/**
 * Reducer for building linked lists.
 */
export default class ArrayReducer extends CollectionReducer {
  /** 
   * Builds an array reducer. See {@link CollectionReducer} for more information.
   * @param  {CollectionConfiguration} configuration - the configuration needed to build the collection
   */
  constructor(configuration) {
    super(arrayApi, configuration);
  }
}