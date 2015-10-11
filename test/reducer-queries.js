import chai from 'chai';
import hamt from 'hamt';
import From, {Constants} from '../src/index.js';

const expect = chai.expect;

describe('Reducer queries', () => {

  // Query reducing...

  it('should reduce the query From.value(10) to 10', () => {
    // Arrange
    const query = From.value(10);
    // Act
    const reducer = query.build();
    const value = reducer.reduce(undefined, undefined);
    // Assert
    expect(value).to.equal(10);
  });

  it('should reduce the query From.value(10).select(x => x * 2) to 20', () => {
    // Arrange
    const query = From.value(10).select(x => x * 2);
    // Act
    const reducer = query.build();
    const value = reducer.reduce(undefined, undefined);
    // Assert
    expect(value).to.equal(20);
  });

  it('should reduce the query From.value(10).where(x => x === 10) to 10', () => {
    // Arrange
    const query = From.value(10).where(x => x === 10);
    // Act
    const reducer = query.build();
    const value = reducer.reduce(undefined, undefined);
    // Assert
    expect(value).to.equal(10);
  });

  it('should reduce the query From.value(10).where(x => x === 20) to undefined', () => {
    // Arrange
    const query = From.value(10).where(x => x === 20);
    // Act
    const reducer = query.build();
    const value = reducer.reduce(undefined, undefined);
    // Assert
    expect(value).to.not.exist;
  });

  it('should reduce the query From.events().ofType("abc") and events { type: "abc" } to { type: "abc" }', () => {
    // Arrange
    const query = From.events().ofType('abc');
    const event = { type: 'abc' };
    // Act
    const reducer = query.build();
    const value = reducer.reduce(undefined, event);
    // Assert
    expect(value).to.deep.equal(event);
  });

  it('should reduce the query From.events().ofType("abc") and events { type: "def" } to undefined', () => {
    // Arrange
    const query = From.events().ofType('abc');
    const event = { type: 'def' };
    // Act
    const reducer = query.build();
    const value = reducer.reduce(undefined, event);
    // Assert
    expect(value).to.not.exist;
  });

  it('should reduce the query From.events().ofAnyType() and events { type: "abc" } to { type: "abc" }', () => {
    // Arrange
    const query = From.events().ofAnyType();
    const event = { type: 'abc' };
    // Act
    const reducer = query.build();
    const value = reducer.reduce(undefined, event);
    // Assert
    expect(value).to.deep.equal(event);
  });

  it('should reduce constant structures to themselves', () => {
    // Arrange
    const structure = { foo: 'abc', bar: 'def' };
    const query = From.structure(structure);
    // Act
    const reducer = query.build();
    const state = reducer.reduce(undefined, undefined);
    // Assert
    expect(state).to.deep.equal(structure);
  });

  it('should reduce reduced properties as part of a structure query', () => {
    // Arrange
    const structure = { 
      foo: 'abc', 
      bar: From.value(10),
      baz: From.events().ofType('test-event-type').select(e => e.value)
    };
    const query = From.structure(structure);
    // Act
    const reducer = query.build();
    const event = { type: 'test-event-type', value: 42 };
    const state = reducer.reduce(undefined, event);
    // Assert
    expect(state).to.deep.equal({
      foo: 'abc',
      bar: 10,
      baz: 42
    });
  });

  it('should reduce the query From.events().ofType("inc").select(_ => 1).sum(0) and 3 events { type: "inc"} to 3', () => {
    const query = From.events().ofType('inc').select(_ => 1).sum(0);
    const event = { type: 'inc' };
    // Act
    const reducer = query.build();
    let state = 0; // TODO: fix seeding.
    for (var i = 0; i < 3; i++) {
      state = reducer.reduce(state, event);
    }
    // Assert
    expect(state).to.equal(3); 
  });

  // Handled events....

  it('should have no handled events for query From.value(10)', () => {
    // Arrange
    const query = From.value(10);
    // Act
    const reducer = query.build();
    // Assert
    expect(hamt.count(reducer.handledEventTypes)).to.equal(0);
  });

  it('should handle "abc" events for query From.events().ofType("abc")', () => {
    // Arrange
    const query = From.events().ofType('abc');
    // Act
    const reducer = query.build();
    // Assert
    expect(hamt.pairs(reducer.handledEventTypes)).to.deep.equal([
      ['abc', true]
    ]);
  });

  it('should handle "*" handled events for query From.events().ofAnyType()', () => {
    // Arrange
    const query = From.events().ofAnyType();
    // Act
    const reducer = query.build();
    // Assert
    expect(hamt.pairs(reducer.handledEventTypes)).to.deep.equal([
      [Constants.ALL_EVENT_TYPES, true]
    ]);
  });

  it('should have no handled events for constant structures', () => {
    // Arrange
    const structure = { foo: 'abc', bar: 'def' };
    const query = From.structure(structure);
    // Act
    const reducer = query.build();
    // Assert
    expect(hamt.count(reducer.handledEventTypes)).to.equal(0);
  });

  it('should handle the union of events handled by reducer properties in structure queries', () => {
    // Arrange
    const structure = { 
      foo: 'abc', 
      bar: From.value(10),
      baz: From.events().ofType('event-type-a').select(e => e.value),
      woo: From.events().ofType('event-type-b')
    };
    const query = From.structure(structure);
    // Act
    const reducer = query.build();
    // Assert
    expect(hamt.pairs(reducer.handledEventTypes)).to.deep.equal([
      ['event-type-a', true],
      ['event-type-b', true]
    ]);
  });

  it('should handle "abc" events for query From.events().ofType("abc").select(_ => 1).sum(0)', () => {
    // Arrange
    const query = From.events().ofType('abc').select(_ => 1).sum(0);
    // Act
    const reducer = query.build();
    // Assert
    expect(hamt.pairs(reducer.handledEventTypes)).to.deep.equal([
      ['abc', true]
    ]);
  });

});