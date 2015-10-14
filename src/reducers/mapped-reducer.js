import ChainedReducer from './chained-reducer.js';

/**
 * <b>INTERNAL</b>
 * Yields its parent's results after mapping them through a selector function.
 */
export default class MappedReducer extends ChainedReducer {
  /**
   * Constructs a reducer that yields its parent's results after mapping them through a selector function
   * @param  {Reducer} parent - The parent reducer.
   * @param  {function(x:T1):T2} - The selector function.
   */
  constructor(parent, selector) {
    super(parent);
    this._selector = selector;
  }

  /** @ignore */
  process(valueMaybe) {
    return valueMaybe.map(([eventNumber, x]) => [eventNumber, this._selector(x)]);
  }
}