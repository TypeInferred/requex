import ChainedReducer from './chained-reducer.js';

/**
 * <b>INTERNAL</b>
 * Yields flat-mapped versions of its parent's results.
 */
export default class FlatMappedReducer extends ChainedReducer {
  /**
   * Constructs a reducer that expands its parent's results by passing them through a manySelector function.
   * @param  {Reducer} parent - The parent reducer.
   * @param  {function(x:T1):T2} - The manySelector function.
   */
  constructor(parent, manySelector) {
    super(parent);
    this._manySelector = manySelector;
  }

  /** @ignore */
  process(parentValues) {
    return parentValues.reduce((acc, [eventNumber, x]) => {
      //TODO: need to think about the ramifications of eventNumber not being distinct per update here...
      this._manySelector(x).forEach(y => acc.push([eventNumber, y]));
      return acc;
    }, []);
  }
}