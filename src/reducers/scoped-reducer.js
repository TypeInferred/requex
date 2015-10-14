import Reducer from './reducer.js';

/**
 * <b>INTERNAL</b>
 * A reducer that scopes the events that its parent reducers (that is, reducers earlier in the fluent chain)
 * can handle.
 */
export default class ScopedReducer extends Reducer {
  /**
   * Constructs a reducer that scopes the events that its parent reducers (that is, reducers earlier in the fluent chain)
   * can handle.
   * @param  {Reducer} parent - The parent reducer.
   * @param  {function(x:Event):boolean} predicate - The predicate to determine which events are allowed.
   */
  constructor(parent, predicate) {
    super();
    this._parent = parent;
    this._predicate = predicate;
  }

  /** @ignore */
  getNextUpdates(context) {
    const previousEvents = context.enterEventScope(this._predicate);
    const updates = this._parent.reduce(context);
    context.exitEventScope(previousEvents);
    return updates;
  }
}