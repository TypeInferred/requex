import ChainedReducer from './chained-reducer.js';

export default class FoldingReducer extends ChainedReducer {
  constructor(parent, accumulate, seed) {
    super(parent);
    this.accumulate = accumulate;
    this.seed = seed;
  }

  process(valueMaybe, context) {
    context.enter('fold');
    const stored = context.getStoredValue();
    // Here we emit the seed the first time and then
    // and then any accumulations. We don't compress
    // as there could be multiple levels of reduction.
    let acc = stored ? stored[0] : this.seed;
    const result = stored ? [] : [[-1, acc]];
    valueMaybe.forEach(([eventNumber, v]) => {
      acc = this.accumulate(acc, v);
      result.push([eventNumber, acc]);
    });
    context.store([acc]);
    context.exit();
    return result;
  }
}