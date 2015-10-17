import Reducer from './reducer.js';
import Option from '../option.js';

/**
 * <b>INTERNAL</b>
 * Yields the provided value <i>once</i>.
 */
export default class ValueReducer extends Reducer {
  /**
   * Constructs a reducer that yields the provided value <i>once</i>.
   * @param value - The value to produce
   */
  constructor(value) {
    super();
    this._value = value;
  }

  /** @ignore */
  reduce(context) {
    const previous = context.getPreviousReduction();
    return previous.isSome ? Option.none() : Option.some(this._value);
  }
}