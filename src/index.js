import ReducerBuilder from './reducer-builder.js';
import ValueReducer from './reducers/value-reducer.js';
import EventReducer from './reducers/event-reducer.js';
import AnyEventReducer from './reducers/any-event-reducer.js';
import StructureReducer from './reducers/structure-reducer.js';
import DictionaryObjectReducer from './reducers/dictionary-object-reducer.js';
import ArrayReducer from './reducers/array-reducer.js';
import NeverReducer from './reducers/never-reducer.js';
import MergeReducer from './reducers/merge-reducer.js';
import CombineLatestReducer from './reducers/combine-latest-reducer.js';
import _Option from './option.js';
import * as _Deltas from './collection-deltas.js';

/**
 * Represents an optional type, i.e., some value or none.
 * @type {Option<T>}
 */
export const Option = _Option;

/**
 * Factories for constructing deltas to collections.
 * @type {Object}
 */
export const Deltas = _Deltas;

/**
 * A factory for creating reducer queries.
 */
export default class Reduce {
  /**
   * Creates a reducer query over events in scope matching the event type specified.
   * @param {string} eventType - The event type
   * @returns {ReducerBuilder} The query over the matching events
   */
  static eventsOfType(eventType) {
    return new ReducerBuilder(new EventReducer(eventType));
  }

  /**
   * Creates a reducer query of over all events in scope.
   * @returns {ReducerBuilder} The query over the events in scope
   */
  static allEvents() {
    return new ReducerBuilder(new AnyEventReducer());
  }

  /**
   * A reducer query returning the value provided.
   * @param value - The value
   * @returns {ReducerBuilder} - The reducer query containing the value
   */
  static value(value) {
    return new ReducerBuilder(new ValueReducer(value));
  }

  /**
   * Builds a reducer query from a structure of reducer queries and constants representing
   * the reduced structure.
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static structure(reducerStructure) {
    return new ReducerBuilder(new StructureReducer(reducerStructure));
  }

  /**
   * @typedef {Object} CollectionConfiguration
   * @property {function(args:TArgs):TItem|function(args:TArgs):ReducerBuilder<TItem>} itemFactory - The function that builds new items from arguments produced by the additions reducer. The items can be constant values or ReducerBuilders.
   * @property {Array<ReducerBuilder>} deltas - The reducers that produces deltas to alter the collection
   */

  /**
   * Builds a reducer query of a map-like dictionary object from an item factory and an array of reducers to supply deltas to the collection.
   * @param  {CollectionConfiguration} configuration - the configuration needed to build the list
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static dictionaryObjectOf(configuration) {
    return new ReducerBuilder(new DictionaryObjectReducer(configuration));
  }

  /**
   * Builds a reducer query of an array from an item factory and an array of reducers to supply deltas to the collection.
   * @param  {CollectionConfiguration} configuration - the configuration needed to build the list
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static arrayOf(configuration) {
    return new ReducerBuilder(new ArrayReducer(configuration));
  }

  /**
   * A reducer query that never produces any updates in state.
   * @returns {ReducerBuilder} - The reducer query builder
   */
  static never() {
    return new ReducerBuilder(new NeverReducer());
  }

  /**
   * Builds a reducer query from an array of reducer queries where the produced value is the concatenation of all the
   * changes in the current scope into an array.
   * @param  {Array<ReducerBuilder<T>>} reducers - The reducers producing the updates to concatenate.
   * @return {Reducer<Array<T>>} The reducer of the concatenated updates
   */
  static merge(reducers) {
    return new ReducerBuilder(new MergeReducer(reducers));
  }

  /**
   * Builds a reducer query from an array of reducer queries where the produced value is the concatenation of all the
   * latest values in the current scope into an array.
   * @param  {Array<ReducerBuilder<T>>} reducers - The reducers producing the updates to concatenate.
   * @return {Reducer<Array<T>>} The reducer of the concatenated updates
   */
  static combineLatest(reducers) {
    return new ReducerBuilder(new CombineLatestReducer(reducers));
  }
}