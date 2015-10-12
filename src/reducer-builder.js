import ReducerDescriptor from './reducer-descriptor.js';
import hamt from 'hamt';

/**
 * A builder for reducers.
 */
export default class ReducerBuilder {

  /** @ignore */
  constructor(reduceChain, handledEventTypes) {
    /** @ignore */
    this._reduceChain = reduceChain;
    /** @ignore */
    this._handledEventTypes = handledEventTypes;
  }

  /**
   * Maps the reduced value onto another value using a function.
   * @param {function(x:T1):T2} selector - The mapping function
   * @returns {ReducerBuilder<T2>} A reducer builder that maps the value
   */
  select(selector) {
    if (!selector) throw new Error('Missing selector argument');
    return this._chain(({hasChainCompleted, chainValue, next}) => hasChainCompleted && next(selector(chainValue)));
  }

  /**
   * Filters the value by applying a predicate function to the value
   * @param {function(x:T):boolean} predicate - The predicate function
   * @returns {ReducerBuilder<T>} A reducer builder than filters using the predicate
   */
  where(predicate) {
    if (!predicate) throw new Error('Missing predicate argument');
    return this._chain(({hasChainCompleted, chainValue, next}) => hasChainCompleted && predicate(chainValue) && next(chainValue));
  }

  /**
   * Accumulates the sum of the reduced values.
   * @param {number|string} zeroValue - The zero value for the addition operator.
   * @returns {ReducerBuilder<T>} A reducer builder that accumulates the sum
   */
  sum(zeroValue) {
    return this._chain(context => {
      if (context.hasChainCompleted) {
        const acc = context.previousState || zeroValue;
        context.next(acc + context.chainValue);
      } else {
        context.next(zeroValue);
      }
    }, (next, _) => next(zeroValue));
  }

  //TODO: This needs a massive refactor + removal of allocation from the hot paths!
  /** ignore */
  lift() {
    return this._chain(({hasChainCompleted, previousState, previousAuxillary, chainValue, chainAuxillary, event, next}) => {
      const reducerStructure = chainValue;
      // TODO: Fix passing handledEventTypes through continuation. How to do performantly? Reference check?
      // TODO: Move this outside of here: {
      if (typeof reducerStructure !== 'object') throw new Error('Invalid reducerStructure argument. Expected an object.');
      const keys = Object.keys(reducerStructure);
      const constantKeys = keys.filter(k => !(reducerStructure[k] instanceof ReducerBuilder));
      const reducerKeys = keys.filter(k => reducerStructure[k] instanceof ReducerBuilder);
      const reducerLookup = reducerKeys.reduce((acc, k) => hamt.set(k, reducerStructure[k].build(), acc), hamt.empty);
      const handledEventTypes = hamt.values(reducerLookup).reduce((acc, reducerProperty) => {
        const reducerPropertyHandledEvents = hamt.keys(reducerProperty.handledEventTypes);
        return reducerPropertyHandledEvents.reduce((innerAcc, eventType) => hamt.set(eventType, true, innerAcc), acc);
      }, hamt.empty);
      // }
      const previousStructure = previousState;
      const previousAuxillaryStructure = previousAuxillary;
      // Track whether the state has actually changed. If not, we can return the previous state.
      const isSeeding = previousStructure === undefined || event === undefined;
      let hasStateChanged = isSeeding;
      let hasAuxillaryChanged = isSeeding;
      let nextState = {};
      let nextAux = {};
      // Reduce reducer properties using previous state and the event
      reducerKeys.forEach(k => {
        const previousPropertyValue = previousStructure && previousStructure[k];
        const previousPropertyAux = previousAuxillaryStructure && previousAuxillaryStructure[k];
        const propertyReducer = hamt.get(k, reducerLookup);
        // Property can change on initial seed or if the reducer can handle the event.
        const couldPropertyChange = isSeeding || propertyReducer.couldHandle(event);
        if (couldPropertyChange) {
          const reductionResult = propertyReducer.reduce({
            previousState: previousPropertyValue,
            previousAuxillary: previousPropertyAux,
            chainValue: previousPropertyValue,
            chainAuxillary: previousPropertyAux,
            hasChainCompleted: !isSeeding,
            event
          });
          const newPropertyValue = reductionResult.newState;
          const newPropertyAux = reductionResult.newAuxillary;
          // If it has changed we take the new value and will produce a new version of the state.
          if (newPropertyValue !== previousPropertyValue) {
            hasStateChanged = true;
            nextState[k] = newPropertyValue;
          } else {
            nextState[k] = previousPropertyValue;
          }
          // Same for the aux
          if (newPropertyAux !== previousPropertyAux) {
            hasAuxillaryChanged = true;
            nextAux[k] = newPropertyAux;
          } else {
            nextAux[k] = previousPropertyAux;
          }
        } else {
          nextState[k] = previousPropertyValue;
          nextAux[k] = previousPropertyAux;
        }
      });
      if (hasStateChanged) {
        // Copy constants
        constantKeys.forEach(k => nextState[k] = reducerStructure[k]);
      } else {
        nextState = previousState;
      }
      if (!hasAuxillaryChanged) {
        nextAux = previousAuxillaryStructure;
      }
      next(nextState, nextAux);
    });
  }

  /**
   * Constructs a reducer descriptor from the query defined using the builder.
   * @returns {ReducerDescriptor} a reducer descriptor
   */
  build() {
    const reduce = (context = {}) => {
      let newState, newAuxillary;
      this._reduceChain({
        next: (r, a) => {
          newState = r;
          newAuxillary = a;
        },
        previousState: context.previousState,
        previousAuxillary: context.previousAuxillary, // Auxillary state for accumulators.
        event: context.event,
        chainValue: context.event,
        hasChainCompleted: context.event !== undefined,
        chainAuxillary: context.previousAuxillary
      });
      return {newState, newAuxillary};
    };
    return new ReducerDescriptor(reduce, this._handledEventTypes);
  }

  /** @ignore */
  _chain(resultHandler) {
    return new ReducerBuilder(context => {
        let chainValue, chainAuxillary, hasChainCompleted;
        this._reduceChain(Object.assign({}, context, {
          next: (r, a) => {
            chainValue = r;
            chainAuxillary = a;
            hasChainCompleted = true;
          }
        }));
        chainAuxillary = chainAuxillary || context.chainAuxillary;
        resultHandler(Object.assign({}, context, {
          chainValue,
          chainAuxillary,
          hasChainCompleted
        }));
      },
      this._handledEventTypes
    );
  }
}