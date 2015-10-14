/**
 * <b>INTERNAL</b>
 * Provides context for executing reducers so they can store and retrieve state.
 */
export default class ReducerContext {
  /**
   * Constructs a context used to by a tree of reducers.
   * @param {Object} - The previous auxillary state used to retrieve stored values.
   * @param {Array<Event>} - The events to reduce.
   */
  constructor(previousAuxillary, events) {
    /**
     * This is the previous auxillary state used to retrieve stored values.
     * @type {Object}
     */
    this._previousAuxillary = previousAuxillary || {};
    /**
     * This is the current level of scope. I.e., the route from the root to the current reducer.
     * @type {Array<string>}
     */
    this._route = [];
    /**
     * This is the current number of greedy consumers that will consume the updates produced from this context.
     * @type {number}
     */
    this._greedyConsumerCount = 0;
    /**
     * This contains the auxillary state built up in a reduction pass. For example, this
     * may include accumulator values for folds that cannot easily be derived from looking 
     * at the previous state.
     * 
     * @type {Object}
     *
     * @example <caption>Illustration where previous state isn't the same as the accumulator</caption>
     * From.events().ofAnyType().select(_ => 1).sum(0).select(x => 2 * x)
     */
    this.nextAuxillary = {};
    /**  
     * The events being reduced.
     * @type {Array<Event>}
     */
    this.events = events;
  }

  /**
   * Enters a scoped storage region. This is used to address auxillary state.
   * @param {string} name - The name of the scope region
   */
  enter(name) {
    this._route.push(name);
  }

  /**
   * Exits a scoped storage region. See {@link ReducerContext#enter} for more details.
   */
  exit() {
    this._route.pop();
  }

  /**
   * Ensures that results from inside the "greedy region" using the context are
   * not optimised away. See {@link ReducerContext#optimise} for more details.
   */
  enterGreedy() {
    this._greedyConsumerCount++;
  }

  /**
   * Exits a greedy region. See {@link ReducerContext#enterGreedy} for more details.
   */
  exitGreedy() {
    this._greedyConsumerCount--;
  }

  /**
   * Enters a region where the scope of the events is limited to those that pass the predicate. This is useful
   * for addressing individual elements in a collection.
   * @param  {function(e:Event):boolean} predicate - The predicate to determine which events are in scope.
   * @return {Array<Event>} The unscoped events to put back at the end of the region.
   */
  enterEventScope(predicate) {
    const unscopedEvents = this.events;
    this.events = this.events.filter(([eventNumber, event]) => predicate(event));
    return unscopedEvents;
  }

  /**
   * Exits a region of event scoping. See {@link ReducerContext#enterEventScope}.
   * @param  {Array<Event>} unscopedEvents - The unscoped events that were present when entering the region. 
   */
  exitEventScope(unscopedEvents) {
    this.events = unscopedEvents;
  }

  /**
   * Optimises a batch of updates by dropping all but the latest update where there are
   * no consumers that are greedy (i.e., that need to consume all updates for correctness). 
   * 
   * @example <caption>Pure projections can safely drop all but the latest results</caption>
   * From.events().ofAnyType().select(e => e.value).select(x => 2 * x)
   * // Not dropped: [{ value: 1 }, { value: 2}]  =>  4
   * // Dropped:     [{ value: 2 }]               =>  4
   * // ^^^ Same results
   *
   * @example <caption>Accumulations must see all values otherwise the results are different</caption>
   * From.events().ofAnyType().select(e => e.value).sum(0)
   * // Not dropped: [{ value: 1 }, { value: 2}]  =>  3
   * // Dropped:     [{ value: 2 }]               =>  2
   * // ^^^ Different results
   *
   * @example <caption>Filters must see all values otherwise the results are different</caption>
   * From.events().ofAnyType().select(e => e.value).where(x => x < 2)
   * // Not dropped: [{ value: 1 }, { value: 2}]  =>  2
   * // Dropped:     [{ value: 2 }]               =>  _
   * // ^^^ Different results
   */
  optimise(updates) {
    if (updates.length === 0 || this._greedyConsumerCount > 0) {
      return updates;
    }
    return [updates[updates.length - 1]];
  }

  /**
   * Stores a value to the new auxillary state.
   * It is stored under the current scope.
   * @param value - The value to store.
   *
   * @example <caption> Stores the pair `{ 'foo--bar': true }` in the new auxillary state.</caption>
   * context.enter('foo');
   * context.enter('bar');
   * context.store(true)
   * context.exit();
   * context.exit();
   */
  store(value) {
    this.nextAuxillary[this._route.join('--')] = value; // TODO: Need to ensure we avoid collisions here.
  }

  /**
   * Retrieves a previously stored value from the previous auxillary state.
   * @return {Object} - The value found in the store if it exists.
   */
  getStoredValue() {
    return this._previousAuxillary[this._route.join('')];
  }
}