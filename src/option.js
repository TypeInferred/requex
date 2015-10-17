let none;

/**
 * Represents an optional type, i.e., some value or none.
 */
export default class Option {
  /**
   * @private
   */
  constructor(hasValue, value) {
    this._value = value;
    /**
     * Returns true if the option wraps a value, i.e., if it is some
     * @type {Boolean}
     */
    this.isSome = hasValue;
    /**
     * Returns true if the option doesn't wrap a value, i.e., if it is none
     * @type {Boolean}
     */
    this.isNone = !this.isSome;
  }

  /**
   * Returns none.
   * @return {[type]} [description]
   */
  static none() {
    return none || (none = new Option(false));
  }

  /**
   * Returns the value wrapped as a some option. 
   * @param  {T} value - The value the wrap
   * @return {Option<T>} The value wrapped in an option
   */
  static some(value) {
    return new Option(true, value);
  }

  /**
   * Returns the value if the option is a some otherwise throws.
   * @return {T} The value.
   */
  get() {
    if (this.isNone) throw new Error('Expected some');
    return this._value;
  }

  /**
   * Maps the value wrapped in the option if any.
   * @param  {function(x:T1):T2} selector - The mapping function
   * @return {Option<T2>} The mapped option
   */
  map(selector) {
    return this.isNone ? this : Option.some(selector(this._value));
  }

  /**
   * Filters the value wrapped in the option if any. If it passes the predicate retains some otherwise none.
   * @param  {function(x:T):boolean} predicate - The filter function
   * @return {Option<T>} The filtered option
   */
  filter(predicate) {
    return this.isSome && predicate(this._value) ? this : Option.none(); 
  }

  /**
   * Returns the value wrapped in the option if some otherwise the other value passed as an argument.
   * @param  {T} otherValue - The alternate value to return
   * @return {T} The wrapped value if some else otherValue
   */
  otherwise(otherValue) {
    return this.isSome ? this._value : otherValue;
  }

  /**
   * Returns the seed if none otherwise accumulates a new value using the seed and the wrapped value using the
   * accumulator function.
   * @param  {function(acc:TAcc, x:T)} accumulator - The function to accumulate a result if some
   * @param  {TAcc} seed - The value to return if none wrapped
   * @return {TAcc} The accumulated value or the seed if none
   */
  reduce(accumulator, seed) {
    return this.isSome ? accumulator(seed, this._value) : seed;
  }

  /**
   * Returns none if none otherwise the option produced by projecting the wrapped value onto another option using
   * the selector function.
   * @param  {function(x:T1):Option<T2>} selector - The projection function
   * @return {Option<T2>} The resulting option.
   */
  bind(selector) {
    return this.isSome ? selector(this._value) : Option.none();
  }
}