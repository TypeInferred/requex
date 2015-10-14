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
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.equal(10);
  });

  it('should reduce the query From.value(10).select(x => x * 2) to 20', () => {
    // Arrange
    const query = From.value(10).select(x => x * 2);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.equal(20);
  });

  it('should reduce the query From.value(10).where(x => x === 10) to 10', () => {
    // Arrange
    const query = From.value(10).where(x => x === 10);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.equal(10);
  });

  it('should reduce the query From.value(10).where(x => x === 20) to undefined', () => {
    // Arrange
    const query = From.value(10).where(x => x === 20);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.not.exist;
  });

  it('should reduce the query From.events().ofType("abc") and events { type: "abc" } to { type: "abc" }', () => {
    // Arrange
    const query = From.events().ofType('abc');
    const event = { type: 'abc' };
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce({event});
    // Assert
    expect(newState).to.deep.equal(event);
  });

  it('should reduce the query From.events().ofType("abc") and events { type: "def" } to undefined', () => {
    // Arrange
    const query = From.events().ofType('abc');
    const event = { type: 'def' };
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce({event});
    // Assert
    expect(newState).to.not.exist;
  });

  it('should reduce the query From.events().ofAnyType() and events { type: "abc" } to { type: "abc" }', () => {
    // Arrange
    const query = From.events().ofAnyType();
    const event = { type: 'abc' };
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce({event});
    // Assert
    expect(newState).to.deep.equal(event);
  });

  it('should reduce constant structures to themselves', () => {
    // Arrange
    const structure = { foo: 'abc', bar: 'def' };
    const query = From.structure(structure);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.deep.equal(structure);
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
    const {newState} = reducer.reduce({event});
    // Assert
    expect(newState).to.deep.equal({
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
    let state, aux;
    for (var i = 0; i < 3; i++) {
      const {newState, newAuxillary} = reducer.reduce({previousState: state, previousAuxillary: aux, event});
      state = newState;
      aux = newAuxillary;
    }
    // Assert
    expect(state).to.equal(3); 
  });

  it('should reduce queries containing projections after reductions', () => {
    const query = From.events().ofType('inc').select(_ => 1).sum(0).select(x => 2 * x);
    const event = { type: 'inc' };
    // Act
    const reducer = query.build();
    let state, aux;
    for (var i = 0; i < 3; i++) {
      const {newState, newAuxillary} = reducer.reduce({previousState: state, previousAuxillary: aux, event});
      state = newState;
      aux = newAuxillary;
    }
    // Assert
    expect(state).to.equal(6); 
  });

  it('should reduce queries containing projections before reductions with batches of events', () => {
    const query = From.events().ofType('inc').select(_ => 1).sum(0);
    const events = [{ type: 'inc' }, { type: 'inc' }, { type: 'inc' }];
    // Act
    const reducer = query.build();
    const {newState, newAuxillary} = reducer.reduce({events});
    // Assert
    expect(newState).to.equal(3); 
  });

  it('should reduce queries containing filters with batches of events', () => {
    const query = From.events().ofType('inc').select(e => e.value).where(x => x < 2);
    const events = [{ type: 'inc', value: 1 }, { type: 'inc', value: 2 }];
    // Act
    const reducer = query.build();
    const {newState, newAuxillary} = reducer.reduce({events});
    // Assert
    expect(newState).to.equal(1); 
  });

  it('should reduce queries containing multiple reductions', () => {
    const query = From.events().ofType('inc')  //          e,  e
                               .select(_ => 1) //          1,  1
                               .sum(1)         //      1,  2,  3
                               .sum(0);        //  0,  1,  3,  6
    const events = [{ type: 'inc' }, { type: 'inc' }];
    // Act
    const reducer = query.build();
    const {newState, newAuxillary} = reducer.reduce({events});
    // Assert
    expect(newState).to.equal(6); 
  });

  it('should reduce to seed values before a matching event occurs', () => {
    const query = From.events().ofAnyType().where(_ => false).sum(10);
    const event = { type: 'inc' };
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce({event});
    // Assert
    expect(newState).to.equal(10); 
  });
});