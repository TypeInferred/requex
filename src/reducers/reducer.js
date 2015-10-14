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
  getNextUpdates(context) {
    throw new Error('Abstract method.');
  }

  /**
   * Computes the updates to the reducer's state in the given context. May optimise. See {@link ReducerContext#optimise} for more details.
   */
  reduce(context) {
    const updates = this.getNextUpdates(context);
    return context.optimise(updates);
  }
}