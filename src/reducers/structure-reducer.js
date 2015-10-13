import Reducer from './reducer.js';
import ReducerBuilder from '../reducer-builder.js'; //Hmm... need to make sure we don't make any circular refs here.

export default class StructureReducer extends Reducer {
  constructor(structure) {
    super();
    if (typeof structure !== 'object') throw new Error('Invalid structure argument. Expected an object.');
    const keys = Object.keys(structure);
    this.constants = {};
    keys
      .filter(k => !(structure[k] instanceof ReducerBuilder))
      .forEach(k => this.constants[k] = structure[k]);
    this.reducerProperties = keys
      .filter(k => structure[k] instanceof ReducerBuilder)
      .map(k => [k, structure[k].parent]);
    //this.handledEventTypes = merge(this.reducerProperties.map(reducer => reducer.handledEventTypes);
  }

  getNext(context) {
    context.enter('obj');
    const hasPreviousValue = !!context.getStoredValue();
    const propertyChanges = {};
    const originalProperties = {};
    this.reducerProperties.forEach(([k, reducer]) =>
      this.appendPropertyChanges(originalProperties, propertyChanges, k, reducer, context));
    const objectChanges = this.computeObjectChanges(hasPreviousValue, originalProperties, propertyChanges);
    context.store(true);
    context.exit();
    return objectChanges;
  }

  appendPropertyChanges(originalProperties, propertyChanges, k, reducer, context) {
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

  computeObjectChanges(hasPreviousValue, originalProperties, propertyChanges) {
    const eventNumbers = Object.keys(propertyChanges).map(k => 1 * k).sort();
    if (eventNumbers.length) {
      const objectChanges = [];
      let currentObject = Object.assign({}, this.constants, originalProperties);
      eventNumbers.forEach(id => {
        const nextObject = Object.assign({}, currentObject, propertyChanges[id]);
        currentObject = nextObject;
        return objectChanges.push([id, nextObject]);
      });
      return objectChanges;
    } else if (!hasPreviousValue) {
      return [[-1, Object.assign({}, this.constants)]];
    } else {
      return [];
    }
  }
}