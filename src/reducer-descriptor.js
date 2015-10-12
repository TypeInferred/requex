import hamt from 'hamt';
import {ALL_EVENT_TYPES} from './constants.js';

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
     * @type {function({previousState: Object, previousAuxillary: Object, event: Object}) : {newState: Object, newAuxillary: Object}}
     */
    this.reduce = reduce;
    /**
     * @type {HAMT<string>}
     */
    this.handledEventTypes = handledEventTypes;
  }

  /**
   * Returns true if the reduce function could handle the event type.
   * @param {string} eventType - The event type
   * @returns {boolean} Whether the event type may be handled by the reducer
   */
  couldHandle(eventType) {
    return hamt.get(ALL_EVENT_TYPES, this.handledEventTypes) || hamt.get(eventType, this.handledEventTypes) || false;
  }
}