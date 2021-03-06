import Reducer from './reducer.js';
import {SOURCE, INNER_SOURCE} from './storage-keys.js';

/**
 * <b>INTERNAL</b>
 * A reducing reducer.
 */
export default class FlatReducedReducer extends Reducer {
  /**
   * Creates a reducer from the source's value using the function provided then yields results from that reducer
   * until the next source value.
   *
   * TODO: Marble diagram to explain!
   * 
   * @param  {Reducer<T1>} source - The source reducer
   * @param  {function(x:T1):ReducerBuilder<T2>} flatReducer - The function that selects a reducer from a value in the underlying source
   */
  constructor(source, flatReducer) {
    super();
    this._source = source;
    this._flatReducer = flatReducer;
  }

  /** @ignore */
  reduce(context) {
    const previousReducerSeed = context.getPreviousReduction(SOURCE);
    const newReducerSeed = context.getValue(SOURCE, this._source);
    const isNewReductionChain = newReducerSeed.isSome;
    const currentSeed = isNewReductionChain ? newReducerSeed : previousReducerSeed;
    return currentSeed.bind(seed => {
      const reducer = this._flatReducer(seed).unwrap();
      if (isNewReductionChain) {
        return context.getFreshValue(INNER_SOURCE, reducer);
      }
      return context.getValue(INNER_SOURCE, reducer);
    });
  }
}