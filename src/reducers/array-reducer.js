import CollectionReducer from './collection-reducer.js';
import MappedReducer from './mapped-reducer.js';

/** @ignore */
const arrayApi = {
  prepare: ({keys, values}) => ({keys: keys.slice(), values:values.slice()}), // Copy so we can cheat in the put and just use push, TODO: Use mutation for remove and map too.
  empty: () => ({keys: [], values: []}),
  remove: ({keys, values}, key) => {
    const index = keys.indexOf(key);
    if (index >= 0) {
      keys.splice(index, 1);
      values.splice(index, 1);
    }
  },
  put: ({keys, values}, key, value) => {
    const index = keys.indexOf(key);
    if (index >= 0) {
      values[index] = value;
    } else {
      keys.push(key);
      values.push(value);
    }
  },
  forEach: ({keys, values}, f) => keys.forEach((key, i) => f(key, values[i]))
};

/**
 * Reducer for building arrays.
 */
export default class ArrayReducer extends MappedReducer {
  /** 
   * Builds an array reducer. See {@link CollectionReducer} for more information.
   * @param  {CollectionConfiguration} configuration - the configuration needed to build the collection
   */
  constructor(configuration) {
    super(new CollectionReducer(arrayApi, configuration), ({keys, values}) => values);
  }
}