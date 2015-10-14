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
     * This is the current level of scope. I.e., the route from the root to the current reducer.
     * @type {Array<string>}
     */
    this._route = [];
    /**  
     * The events being reduced.
     * @type {Array<Event>}
     */
    this.events = events;
  }

  /**
   * Enters a scoped region. This is used to address auxillary state.
   * @param {string} name - The name of the scope region
   */
  enter(name) {
    this._route.push(name);
  }

  /**
   * Exits a scoped region. This is used to address auxillary state.
   */
  exit() {
    this._route.pop();
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