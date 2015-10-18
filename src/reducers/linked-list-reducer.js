import CollectionReducer from './collection-reducer.js';
import LinkedList from '../linked-list.js';

/** @ignore */
const linkedListApi = {
  prepare: x => x,
  empty: () => LinkedList.nil(),
  remove: (list, itemKey, removedKeys) => LinkedList.filter(list, x => {
    const key = itemKey(x);
    return !removedKeys.includes(key);
  }),
  map: (list, selector) => LinkedList.map(list, selector),
  put: (list, key, value) => LinkedList.cons(value, list)
};

/**
 * Reducer for building linked lists.
 */
export default class LinkedListReducer extends CollectionReducer {
  /** 
   * Builds a linked list reducer. See {@link CollectionReducer} for more information.
   * @param  {CollectionConfiguration} configuration - the configuration needed to build the collection
   */
  constructor(configuration) {
    super(linkedListApi, configuration);
  }
}