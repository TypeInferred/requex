import Reducer from './reducer.js';

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
  getNextUpdates(context) {
    context.enter('value');
    const hasEmitted = context.getStoredValue();
    context.store(true);
    context.exit();
    return hasEmitted ? [] : [[-1, this._value]];
  }
}