import Reducer from './reducer.js';
import Option from '../option.js';
import {SOURCE} from './storage-keys.js';

/**
 * <b>INTERNAL</b>
 * Yields its source's results matching a predicate.
 */
export default class FilteredReducer extends Reducer {
  /**
   * Constructs a reducer that yields its source's results that pass a predicate.
   * @param  {Reducer<T>} source - The source reducer
   * @param  {function(x:T):boolean} - The predicate to test the results from the source
   */
  constructor(source, predicate) {
    super();
    this._predicate = predicate;
    this._source = source;
  }

  /** @ignore */
  reduce(context) {
    return context.getValue(SOURCE, this._source).filter(this._predicate);
  }
}