import Reducer from './reducer.js';

export default class ChainedReducer extends Reducer {
  constructor(parent) {
    super();
    this.parent = parent;
    this.handledEventTypes = parent.handledEventTypes;
  }

  getNext(context) {
    return this.process(this.parent.getNext(context), context);
  }

  process(valueMaybe, context) {
    throw new Error('Abstract method.');
  }
}