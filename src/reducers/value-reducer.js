import Reducer from './reducer.js';

export default class ValueReducer extends Reducer {
  constructor(value) {
    super();
    this.value = value;
  }

  getNext(context) {
    context.enter('value');
    const hasEmitted = context.getStoredValue();
    context.store(true);
    context.exit();
    return hasEmitted ? [] : [[-1, this.value]];
  }
}
