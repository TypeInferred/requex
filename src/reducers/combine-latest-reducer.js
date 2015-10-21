import Reducer from './reducer.js';
import {SOURCE_PREFIX} from './storage-keys.js';
import Option from '../option.js';

/**
 * A reducer that takes an array of reducers and produces an array of their latest values.
 */
export default class CombineLatestReducer extends Reducer {
  /**
   * Constructs a reducer that takes an array of reducers and produces an array of their latest values.
   */
  constructor(sources) {
    super();
    this._sources = sources.map(source => source.unwrap());
  }

  /** @ignore */
  reduce(context) {
    const newSourceValues = this._sources.map((source, i) => {
      const update = context.getValue(SOURCE_PREFIX + i, source);
      const value = update.isSome ? update : context.getPreviousReduction(SOURCE_PREFIX + i, source);
      const hasChanged = update.isSome;
      return [hasChanged, value];
    });
    const hasChanged = newSourceValues.some(([hasValueChanged, _]) => hasValueChanged);
    const hasAllValues = newSourceValues.every(([_, value]) => value.isSome);
    if (hasChanged && hasAllValues) {
      return Option.some(newSourceValues.map(([_, value]) => value.get()));
    } else {
      return Option.none();
    }
  }
}