import Reducer from './reducer.js';
import Option from '../option.js';
import {SOURCE} from './storage-keys.js';

/**
 * <b>INTERNAL</b>
 * Yields mapped versions of its source's results.
 */
export default class MappedReducer extends Reducer {
  /**
   * Constructs a reducer that yields mapped versions of its source's results by passing them through a selector function.
   * @param  {Reducer} source - The source reducer.
   * @param  {function(x:T1):T2} selector - The selector function.
   */
  constructor(source, selector) {
    super();
    this._source = source;
    this._selector = selector;
  }

  /** @ignore */
  reduce(context) {
    return context.getValue(SOURCE, this._source).map(this._selector);
  }
}