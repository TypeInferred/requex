import Reducer from './reducer.js';

/**
 * <b>INTERNAL</b>
 * Base class for reducers that process their parents result.
 * @example <caption>In the following query the {MappedReducer}'s parent is an {AnyEventReducer}</caption>
 * From.events().ofAnyType().select(e => e.value)
 */
export default class ChainedReducer extends Reducer {
  /**
   * @param {Reducer} parent - The parent reducer that feeds this reducer values.
   */
  constructor(parent, isGreedy = false) {
    super();
    this._parent = parent;
    this._isGreedy = isGreedy;
  }

  /** @ignore */
  getNextUpdates(context) {
    this._isGreedy && context.enterGreedy();
    const parentUpdates = this._parent.reduce(context);
    const updates = this.process(parentUpdates, context);
    this._isGreedy && context.exitGreedy();
    return updates;
  }

  /**
   * @param  {Array<T1>} values - The values produced by the parent in the context
   * @param  {ReducerContext} context - The current context
   * @return {Array<T2>} The produced values if any
   * @abstract
   */
  process(values, context) {
    throw new Error('Abstract method.');
  }
}