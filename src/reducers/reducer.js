/**
 * <b>INTERNAL</b>
 * The base type for reducers.
 */
export default class Reducer {
  /**
   * <b>INTERNAL</b>
   * Gets the next reduced values using the context provided. May produce many updates or none.
   * @param  {ReducerContext} context - The context in which to execute the reducer.
   * @return {Array<T>} An array of reduced values or the empty array if no changes have occured
   * @abstract
   */
  getNext(context) {
    throw new Error('Abstract method.');
  }
}