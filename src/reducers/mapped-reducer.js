import ChainedReducer from './chained-reducer.js';

export default class MappedReducer extends ChainedReducer {
  constructor(parent, selector) {
    super(parent);
    this.selector = selector;
  }

  process(valueMaybe) {
    return valueMaybe.map(([eventNumber, x]) => [eventNumber, this.selector(x)]);
  }
}