import Reducer from './reducer.js';
import ReducerBuilder from '../reducer-builder.js'; //Hmm... need to make sure we don't make any circular refs here.

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
  getNext(context) {
    context.enter('obj');
    const hasPreviousValue = !!context.getStoredValue();
    const propertyChanges = {};
    const originalProperties = {};
    this._reducerProperties.forEach(([k, reducer]) =>
      this._appendPropertyChanges(originalProperties, propertyChanges, k, reducer, context));
    const objectChanges = this._computeObjectChanges(hasPreviousValue, originalProperties, propertyChanges);
    context.store(true);
    context.exit();
    return objectChanges;
  }

  /** 
   * Adds the original property value to originalProperties and any changes in value to propertyChanges by
   * the event number when the changes occurred. 
   * @param  {Object} originalProperties - The original properties bag to mutate
   * @param  {Object} propertyChanges - The property changes by event number lookup to mutate
   * @param  {string} k - The property name
   * @param  {Reducer} reducer - The property reducer
   * @param  {ReducerContext} context - The context to execute the reducer
   */
  _appendPropertyChanges(originalProperties, propertyChanges, k, reducer, context) {
    context.enter(k);
    const prevPropertyResult = context.getStoredValue();
    let currentPropertyValue = prevPropertyResult;
    originalProperties[k] = currentPropertyValue;
    reducer.getNext(context).forEach(([eventNumber, propertyValue]) => {
      if (currentPropertyValue !== propertyValue) {
        const propertyChangesForEvent = propertyChanges[eventNumber] || (propertyChanges[eventNumber] = {});
        propertyChangesForEvent[k] = propertyValue;
      }
      currentPropertyValue = propertyValue;
    });
    context.store(currentPropertyValue);
    context.exit();
  }

  /**
   * Given the original property values (at the start of this execution) and the property changes by
   * event number this will construct a sequence of updates by event number to this structure.
   * @param  {Boolean} hasPreviousValue - Whether this structure has already been emitted (if not we emit a seed)
   * @param  {Object} originalProperties - A bag of original property values for the reduced properties
   * @param  {Object} propertyChanges - A lookup by event number to property changes that occurred from that event.
   * @return {Array<Tuple<number, Object>>} The updates to the object by event id.
   */
  _computeObjectChanges(hasPreviousValue, originalProperties, propertyChanges) {
    const eventNumbers = Object.keys(propertyChanges).map(k => 1 * k).sort();
    if (eventNumbers.length) {
      const objectChanges = [];
      let currentObject = Object.assign({}, this._constants, originalProperties);
      eventNumbers.forEach(id => {
        const nextObject = Object.assign({}, currentObject, propertyChanges[id]);
        currentObject = nextObject;
        return objectChanges.push([id, nextObject]);
      });
      return objectChanges;
    } else if (!hasPreviousValue) {
      return [[-1, Object.assign({}, this._constants)]];
    } else {
      return [];
    }
  }
}