import ReducerContext from './reducer-context.js';

/**
 * A reducer along with the event types that it and its children can handle.
 */
export default class ReducerQuery {
  /**
   * Constructs a descriptor that contains the reducer function along with the events
   * that it and its children can handle.
   * @param {ReducerFunc} reduce - The reducer function (see: [Reducers](https://rackt.github.io/redux/docs/basics/Reducers.html#handling-actions))
   */
  constructor(reducer) {
    /**
     * @type {function({previousState: Object, previousAuxillary: Object, event: Object}) : {newState: Object, newAuxillary: Object}}
     */
    this._reducer = reducer;
    /**
     * @type {HAMT<string>}
     */
    this.handledEventTypes = reducer.handledEventTypes;
    this.eventIndex = 0;
  }

  reduce(context) {
    const events = context && (context.events || [context.event]) || [];
    const numberedEvents = events.map(e => [this.eventIndex++, e]);
    const internalContext = new ReducerContext(context && context.previousAuxillary, numberedEvents);
    const updates = this._reducer.getNext(internalContext);
    const newState = updates.length ? updates[updates.length - 1][1] : (context && context.previousState);
    const newAuxillary = internalContext.nextAuxillary;
    return {newState, newAuxillary};
  }
}