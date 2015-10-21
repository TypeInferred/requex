import CollectionReducer from './collection-reducer.js';

/** @ignore */
const dictionaryApi = {
  prepare: x => Object.assign({}, x), //copy
  empty: () => ({}),
  remove: (obj, key) => delete obj[key],
  put: (obj, key, value) => obj[key] = value,
  forEach: (obj, f) => Object.keys(obj).forEach(k => f(k, obj[k]))
};

/**
 * Reducer for building dictionary objects.
 */
export default class DictionaryObjectReducer extends CollectionReducer {
  /** 
   * Builds a dictionary object reducer. See {@link CollectionReducer} for more information.
   * @param  {CollectionConfiguration} configuration - the configuration needed to build the collection
   */
  constructor(configuration) {
    super(dictionaryApi, configuration);
  }
}