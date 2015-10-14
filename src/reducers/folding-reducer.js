import ChainedReducer from './chained-reducer.js';

/**
 * <b>INTERNAL</b>
 * Yields a seed and then accumulated values as its parent's results are thread through an accumulator.
 */
export default class FoldingReducer extends ChainedReducer {
  /**
   * Constructs a reducer that yields a seed and then accumulated values as its parent's results 
   * are thread through an accumulator.
   * @param  {Reducer<T1>} parent - The parent reducer
   * @param  {function(acc:T2, x:T1):T2} accumulate - The accumulator function
   * @param  {T2} seed - The initial value
   */
  constructor(parent, accumulate, seed) {
    super(parent);
    this._accumulate = accumulate;
    this._seed = seed;
  }

  /** @ignore */
  process(valueMaybe, context) {
    context.enter('fold');
    const stored = context.getStoredValue();
    // Here we emit the seed the first time and then
    // and then any accumulations. We don't compress
    // as there could be multiple levels of reduction.
    let acc = stored ? stored[0] : this._seed;
    const result = stored ? [] : [[-1, acc]];
    valueMaybe.forEach(([eventNumber, v]) => {
      acc = this._accumulate(acc, v);
      result.push([eventNumber, acc]);
    });
    context.store([acc]);
    context.exit();
    return result;
  }
}