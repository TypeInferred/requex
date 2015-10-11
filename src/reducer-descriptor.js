/**
 * A reducer along with the event types that it and its children can handle.
 */
export default class ReducerDescriptor {
  /**
   * Constructs a descriptor that contains the reducer function along with the events
   * that it and its children can handle.
   * @param {ReducerFunc} reduce - The reducer function (see: [Reducers](https://rackt.github.io/redux/docs/basics/Reducers.html#handling-actions))
   */
  constructor(reduce, handledEventTypes) {
    /**
     * @type {ReducerFunc}
     */
    this.reduce = reduce;
    /**
     * @type {HAMT<string>}
     */
    this.handledEventTypes = handledEventTypes;
  }
}