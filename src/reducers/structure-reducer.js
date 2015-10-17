import Reducer from './reducer.js';
import ReducerBuilder from '../reducer-builder.js'; //Hmm... need to make sure we don't make any circular refs here.
import Option from '../option.js';

/**
 * <b>INTERNAL</b>
 * Yields an object that is constructed from constant and/or reduced properties. 
 * Yields a maximum of once per event and only when a child property is changed.
 */
export default class StructureReducer extends Reducer {

  /**
   * Constructs a reducer representing the object structure in the specification.
   * @param  {Object} structure - The structure containing constants and reduced properties
   * @return {[type]}
   * @example <caption>A reducer structure containing both reduced and constant properties</caption>
   * From.structure({
   *   foo: 'constant value',
   *   bar: From.events().ofAnyType().select(e => e.value)
   * })
   */
  constructor(structure) {
    super();
    if (typeof structure !== 'object') throw new Error('Invalid structure argument. Expected an object.');
    const keys = Object.keys(structure);
    this._constants = {};
    keys
      .filter(k => !(structure[k] instanceof ReducerBuilder))
      .forEach(k => this._constants[k] = structure[k]);
    this._reducerProperties = keys
      .filter(k => structure[k] instanceof ReducerBuilder)
      .map(k => [k, structure[k].unwrap()]);
  }

  /** @ignore */
  reduce(context) {
    const previous = context.getPreviousReduction()
    const basis = previous.otherwise(this._constants);
    const changed = this._reducerProperties.reduce((outerAcc, [k, reducer]) =>
      // TODO: Really we should ensure k doesn't conflict with any of the storage-keys here.
      context.getValue(k, reducer).reduce((innerAcc, v) => {
        innerAcc = innerAcc || {}; // Avoiding creation of the object until necessary.
        innerAcc[k] = v; // Mutating here rather than using a functional approach to avoid lots of garbage objects.
        return innerAcc;
      }, outerAcc), undefined);
    return changed 
      ? Option.some(Object.assign({}, basis, changed))
      : previous.isSome 
        ? Option.none()
        : Option.some(basis);
  }
}