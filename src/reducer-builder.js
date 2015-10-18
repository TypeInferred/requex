import MappedReducer from './reducers/mapped-reducer.js';
import FlatReducedReducer from './reducers/flat-reduced-reducer.js';
import FilteredReducer from './reducers/filtered-reducer.js';
import ScopedReducer from './reducers/scoped-reducer.js';
import FoldingReducer from './reducers/folding-reducer.js';
import ReducerQuery from './reducer-query.js';
import LinkedList from './linked-list.js';

/**
 * A fluent reducer-query builder.
 */
export default class ReducerBuilder {

  /** @ignore */
  constructor(parent) {
    /** 
     * The previous reducer in the fluent chain.
     * @type {Reducer}
     * @private
     */
    this._parent = parent;
  }

  /**
   * Maps the reduced value onto another value using a function.
   * @param {function(x:T1):T2} selector - The mapping function
   * @returns {ReducerBuilder<T2>} A reducer builder that maps the value
   */
  select(selector) {
    return this.map(selector);
  }

  /**
   * Maps the reduced value onto another value using a function.
   * @param {function(x:T1):T2} selector - The mapping function
   * @returns {ReducerBuilder<T2>} A reducer builder that maps the value
   */
  map(selector) {
    return this._wrap(new MappedReducer(this._parent, selector));
  }


  /**
   * Maps a value onto a reducer and produces values from that producer until the next value.
   * @param  {function(x:T2):ReducerBuilder<T2>} reducerSelector - The function to project a value onto a reducer builder.
   * @return {ReducerBuilder<T2>} A reducer builder
   */
  flatReduce(reducerSelector) {
    return this._wrap(new FlatReducedReducer(this._parent, reducerSelector));
  }

  /**
   * Filters the value by applying a predicate function to the value
   * @param {function(x:T):boolean} predicate - The predicate function
   * @returns {ReducerBuilder<T>} A reducer builder that filters using the predicate
   */
  where(predicate) {
    return this.filter(predicate);
  }

  /**
   * Filters the value by applying a predicate function to the value
   * @param {function(x:T):boolean} predicate - The predicate function
   * @returns {ReducerBuilder<T>} A reducer builder that filters using the predicate
   */
  filter(predicate) {
    return this._wrap(new FilteredReducer(this._parent, predicate));
  }

  /**
   * Scopes the events that are visible to reducers in the fluent chain leading to this.
   * @param  {function(e:Event):boolean} predicate - The predicate to determine if an event is in scope.
   * @returns {ReducerBuilder<T>} A reducer builder that is scoped to events passing the predicate.
   */
  scoped(predicate) {
    return this._wrap(new ScopedReducer(this._parent, predicate));
  }

  /**
   * Accumulates the sum of the reduced values.
   * @param {number|string} zeroValue - The zero value for the addition operator.
   * @returns {ReducerBuilder<T>} A reducer builder that accumulates the sum
   */
  sum(zeroValue) {
    return this._wrap(new FoldingReducer(this._parent, (acc, x) => acc + x, zeroValue));
  }

  /**
   * Accumulates using the accumulate function over the reduced values.
   * @param {function(acc:T2, value:T1): T2} accumulate - The accumulator function
   * @param seedValue - The seed value for the accumulation.
   * @returns {ReducerBuilder<T2>} A reducer builder that accumulates the sum
   */
  fold(accumulate, seedValue) {
    return this._wrap(new FoldingReducer(this._parent, accumulate, seedValue));
  }

  /**
   * Constructs a reducer from the query defined using the builder.
   * @returns {ReducerQuery} a reducer query
   */
  build() {
    return new ReducerQuery(this._parent);
  }

  /**
   * <b>INTERNAL</b>
   * Returns the most recent reducer in the fluent chain.
   * @return {Reducer} The most recent reducer in the fluent chain.
   */
  unwrap() {
    return this._parent;
  }

  /** ignore */
  _wrap(reducer) {
    return new ReducerBuilder(reducer);
  }
}