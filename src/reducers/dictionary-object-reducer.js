import CollectionReducer from './collection-reducer.js';

/** @ignore */
const dictionaryApi = {
  prepare: x => Object.assign({}, x), //copy
  empty: () => ({}),
  remove: (obj, itemKey, removedKeys) => {
    removedKeys.forEach(k => delete obj[k]);
    return obj;
  },
  map: (obj, selector) => {
    Object.keys(obj).forEach(k => obj[k] = selector(obj[k]));
    return obj;
  },
  put: (obj, key, value) => {
    obj[key] = value;
    return obj;
  }
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