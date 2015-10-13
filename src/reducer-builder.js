import MappedReducer from './reducers/mapped-reducer.js';
import FilteredReducer from './reducers/filtered-reducer.js';
import FoldingReducer from './reducers/folding-reducer.js';
import ReducerQuery from './reducer-query.js';

/**
 * A fluent reducer-query builder.
 */
export default class ReducerBuilder {

  /** @ignore */
  constructor(parent) {
    this.parent = parent;
  }

  /**
   * Maps the reduced value onto another value using a function.
   * @param {function(x:T1):T2} selector - The mapping function
   * @returns {ReducerBuilder<T2>} A reducer builder that maps the value
   */
  select(selector) {
    return this._wrap(new MappedReducer(this.parent, selector));
  }

  /**
   * Filters the value by applying a predicate function to the value
   * @param {function(x:T):boolean} predicate - The predicate function
   * @returns {ReducerBuilder<T>} A reducer builder than filters using the predicate
   */
  where(predicate) {
    return this._wrap(new FilteredReducer(this.parent, predicate));
  }

  /**
   * Accumulates the sum of the reduced values.
   * @param {number|string} zeroValue - The zero value for the addition operator.
   * @returns {ReducerBuilder<T>} A reducer builder that accumulates the sum
   */
  sum(zeroValue) {
    return this._wrap(new FoldingReducer(this.parent, (acc, x) => acc + x, zeroValue));
  }

  /**
   * Accumulates using the accumulate function over the reduced values.
   * @param {function(acc:T2, value:T1): T2} accumulate - The accumulator function
   * @param seedValue - The seed value for the accumulation.
   * @returns {ReducerBuilder<T2>} A reducer builder that accumulates the sum
   */
  fold(accumulate, seedValue) {
    return this._wrap(new FoldingReducer(this.parent, accumulate, seedValue));
  }

  /**
   * Constructs a reducer from the query defined using the builder.
   * @returns {ReducerQuery} a reducer query
   */
  build() {
    return new ReducerQuery(this.parent);
  }

  /** ignore */
  _wrap(reducer) {
    return new ReducerBuilder(reducer);
  }
}