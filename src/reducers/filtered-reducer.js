import ChainedReducer from './chained-reducer.js';

export default class FilteredReducer extends ChainedReducer {
  constructor(parent, predicate) {
    super(parent);
    this.predicate = predicate;
  }

  process(valueMaybe) {
    return valueMaybe.filter(([eventNumber, x]) => this.predicate(x));
  }
}