let none;

export default class Option {
  constructor(hasValue, value) {
    this._value = value;
    this.isSome = hasValue;
    this.isNone = !this.isSome;
  }

  static none() {
    return none || (none = new Option(false));
  }

  static some(value) {
    return new Option(true, value);
  }

  get() {
    if (this.isNone) throw new Error('Expected some');
    return this._value;
  }

  map(selector) {
    return this.isNone ? this : Option.some(selector(this._value));
  }

  filter(predicate) {
    return this.isSome && predicate(this._value) ? this : Option.none(); 
  }

  otherwise(otherValue) {
    return this.isSome ? this._value : otherValue;
  }

  reduce(accumulator, seed) {
    return this.isSome ? accumulator(seed, this._value) : seed;
  }

  bind(selector) {
    return this.isSome ? selector(this._value) : Option.none();
  }
}