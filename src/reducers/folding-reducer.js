import Reducer from './reducer.js';
import Option from '../option.js';
import {SOURCE} from './storage-keys.js';

/**
 * <b>INTERNAL</b>
 * Yields a seed and then accumulated values as its source's results are thread through an accumulator.
 */
export default class FoldingReducer extends Reducer {
  /**
   * Constructs a reducer that yields a seed and then accumulated values as its source's results 
   * are thread through an accumulator.
   * @param  {Reducer<T1>} source - The source reducer
   * @param  {function(acc:T2, x:T1):T2} accumulate - The accumulator function
   * @param  {T2} zero - The zero value (must actually behave like zero).
   */
  constructor(source, accumulate, zero) {
    super();
    this._accumulate = accumulate;
    this._zero = zero;
    this._source = source;
  }

  reduce(context) {
    const value = context.getValue(SOURCE, this._source);
    const previous = context.getPreviousReduction();
    const next = value.map(x => this._accumulate(previous.otherwise(this._zero), x));
    return previous.isNone && next.isNone ? Option.some(this._zero) : next;
  }
}