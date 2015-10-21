import Reducer from './reducer.js';
import {SOURCE_PREFIX} from './storage-keys.js';
import Option from '../option.js';

/**
 * A reducer that takes an array of reducers and produces an array of their updated values in each context.
 */
export default class MergeReducer extends Reducer {
  /**
   * Constructs a reducer that takes an array of reducers and produces an array of their updated values in each context.
   */
  constructor(sources) {
    super();
    this._sources = sources.map(source => source.unwrap());
  }

  /** @ignore */
  reduce(context) {
    const newSourceValues = 
      this._sources.map((source, i) => context.getValue(SOURCE_PREFIX + i, source));
    const changedValues =
      newSourceValues.filter(value => value.isSome).map(value => value.get());
    if (changedValues.length) {
      return Option.some(changedValues);
    } else {
      return Option.none();
    }
  }
}