import Reducer from './reducer.js';

/**
 * <b>INTERNAL</b>
 * A reducing reducer.
 */
export default class FlatReducedReducer extends Reducer {
  /**
   * Constructs a reducing reducer. Given a function to select a reducer from the 
   * current value this will do the following.
   *
   * 1. Produce updates from the existing reducer value (if any) using the context until the
   *    first event number where the parent produces a value to turn into a reducer.
   *     
   * 2. Create reducers from the parent updates in turn and generate updates from these producers
   *    given the range of event numbers that they exist in. 
   *
   * TODO: Marble diagram to explain!
   * 
   * Note: there is no overlap in the event numbers handled by any reducer in this "stream".
   * 
   * @param  {[type]} parent      [description]
   * @param  {[type]} flatReducer [description]
   * @return {[type]}             [description]
   */
  constructor(parent, flatReducer) {
    super();
    this._parent = parent;
    this._flatReducer = flatReducer;
  }

  /** @ignore */
  getNextUpdates(context) {
    context.enter('flat-reduce');
    const data = context.getStoredValue();
    const updates = [];
    let currentInput, currentCount;
    //TODO: STOP OVERLAPPING EVENTS AS DESCRIBED ABOVE!
    if (data) {
      const lastInput = currentInput = data.lastInput;
      const lastCount = currentCount = data.lastCount;
      const reducer = this._flatReducer(lastInput);
      context.enter('update' + lastCount);
      reducer.reduce(context).forEach(update => updates.push(update));
      context.exit();
    }
    const parentUpdates = this._parent.reduce(context);
    parentUpdates.forEach(([_, parentValue]) => {
      currentInput = parentValue;
      currentCount++;
      const reducer = this._flatReducer(parentValue).unwrap();
      context.enter('update' + currentCount);
      reducer.reduce(context).forEach(update => updates.push(update));
      context.exit();
    })
    if (currentInput) {
      context.store({lastInput: currentInput, lastCount: currentCount});
    }
    context.exit();
    return updates;
  }
}