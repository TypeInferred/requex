/**
 * <b>INTERNAL</b>
 * The base type for reducers.
 */
export default class Reducer {
  /**
   * Reduces a new value given some previous state if possible.
   * @param  {ReducerContext} context - The context under which to reduce a new state if possible.
   * @return {Option<T>} Some value if able to reduce a value otherwise none.
   */
  reduce(context) {
    throw new Error('Abstract method.');
  }
}