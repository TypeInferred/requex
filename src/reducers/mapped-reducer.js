import ChainedReducer from './chained-reducer.js';

/**
 * <b>INTERNAL</b>
 * Yields mapped versions of its parent's results.
 */
export default class MappedReducer extends ChainedReducer {
  /**
   * Constructs a reducer that yields mapped versions of its parent's results by passing them through a selector function.
   * @param  {Reducer} parent - The parent reducer.
   * @param  {function(x:T1):T2} - The selector function.
   */
  constructor(parent, selector) {
    super(parent);
    this._selector = selector;
  }

  /** @ignore */
  process(parentValues) {
    return parentValues.map(([eventNumber, x]) => [eventNumber, this._selector(x)]);
  }
}