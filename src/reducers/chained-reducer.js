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
  constructor(parent) {
    super();
    this._parent = parent;
  }

  /** @ignore */
  getNext(context) {
    return this.process(this._parent.getNext(context), context);
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