import ChainedReducer from './chained-reducer.js';

/**
 * <b>INTERNAL</b>
 * Yields its parent's results matching a predicate.
 */
export default class FilteredReducer extends ChainedReducer {
  /**
   * Constructs a reducer that yields its parent's results that pass a predicate.
   * @param  {Reducer<T>} parent - The parent reducer
   * @param  {function(x:T):boolean} - The predicate to test the results from the parent
   */
  constructor(parent, predicate) {
    super(parent, true);
    this._predicate = predicate;
  }

  /** @ignore */
  process(parentValues) {
    return parentValues.filter(([eventNumber, x]) => this._predicate(x));
  }
}