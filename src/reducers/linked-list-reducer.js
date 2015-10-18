import CollectionReducer from './collection-reducer.js';
import LinkedList from '../linked-list.js';

/** @ignore */
const linkedListApi = {
  prepare: x => x,
  empty: () => LinkedList.nil(),
  filter: (list, predicate) => LinkedList.filter(list, predicate),
  map: (list, selector) => LinkedList.map(list, selector),
  put: (list, key, value) => LinkedList.cons(value, list)
};

export default class LinkedListReducer extends CollectionReducer {
  constructor(configuration) {
    super(linkedListApi, configuration);
  }
}