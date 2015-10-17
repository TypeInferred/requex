import Reducer from './reducer.js';
import {SOURCE} from './storage-keys.js';

/**
 * <b>INTERNAL</b>
 * A reducer that scopes the events that its source reducers (that is, reducers earlier in the fluent chain)
 * can handle.
 */
export default class ScopedReducer extends Reducer {
  /**
   * Constructs a reducer that scopes the events that its source reducers (that is, reducers earlier in the fluent chain)
   * can handle.
   * @param  {Reducer} source - The source reducer.
   * @param  {function(x:Event):boolean} predicate - The predicate to determine which events are allowed.
   */
  constructor(source, predicate) {
    super();
    this._source = source;
    this._predicate = predicate;
  }

  /** @ignore */
  reduce(context) {
    return context.scopedBy(this._predicate, () => 
      context.getValue(SOURCE, this._source)
    );
  }
}