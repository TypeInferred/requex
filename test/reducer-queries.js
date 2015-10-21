import chai from 'chai';
import Reduce from '../src/index.js';

const expect = chai.expect;

describe('Reducer queries', () => {

  it('should reduce the query Reduce.value(10) to 10', () => {
    // Arrange
    const query = Reduce.value(10);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.equal(10);
  });

  it('should reduce the query Reduce.value(10).select(x => x * 2) to 20', () => {
    // Arrange
    const query = Reduce.value(10).select(x => x * 2);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.equal(20);
  });

  it('should reduce the query Reduce.value(10).where(x => x === 10) to 10', () => {
    // Arrange
    const query = Reduce.value(10).where(x => x === 10);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.equal(10);
  });

  it('should reduce the query Reduce.value(10).where(x => x === 20) to undefined', () => {
    // Arrange
    const query = Reduce.value(10).where(x => x === 20);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.not.exist;
  });

  it('should reduce the query Reduce.eventsOfType("abc") and events { type: "abc" } to { type: "abc" }', () => {
    // Arrange
    const query = Reduce.eventsOfType('abc');
    const event = { type: 'abc' };
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce({event});
    // Assert
    expect(newState).to.deep.equal(event);
  });

  it('should reduce the query Reduce.eventsOfType("abc") and events { type: "def" } to undefined', () => {
    // Arrange
    const query = Reduce.eventsOfType('abc');
    const event = { type: 'def' };
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce({event});
    // Assert
    expect(newState).to.not.exist;
  });

  it('should reduce the query Reduce.allEvents() and events { type: "abc" } to { type: "abc" }', () => {
    // Arrange
    const query = Reduce.allEvents();
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
    const query = Reduce.structure(structure);
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
      bar: Reduce.value(10),
      baz: Reduce.eventsOfType('test-event-type').select(e => e.value)
    };
    const query = Reduce.structure(structure);
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

  it('should reduce structure to seed property values if no event has occurred', () => {
    // Arrange
    const structure = { 
      foo: 'abc', 
      bar: Reduce.value(10),
      baz: Reduce.eventsOfType('test-event-type').select(e => e.value)
    };
    const query = Reduce.structure(structure);
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.deep.equal({
      foo: 'abc',
      bar: 10
    });
  });

  it('should return same object if structure query has not changed', () => {
    // Arrange
    const structure = { 
      foo: 'abc', 
      bar: Reduce.value(10),
      baz: Reduce.eventsOfType('test-event-type').select(e => e.value)
    };
    const query = Reduce.structure(structure);
    const reducer = query.build();
    const firstEvent = { type: 'test-event-type', value: 42 };
    const initialOutput = reducer.reduce({event: firstEvent});
    // Act
    const secondEvent = { type: 'unhandled-event-type' };
    const secondOutput = reducer.reduce({event: secondEvent, previousState: initialOutput.newState, previousAuxillary: initialOutput.newAuxillary});
    // Assert
    expect(initialOutput.newState === secondOutput.newState).to.be.true;
  });

  it('should reduce the query Reduce.eventsOfType("inc").select(_ => 1).sum(0) and 3 events { type: "inc"} to 3', () => {
    // Arrange
    const query = Reduce.eventsOfType('inc').select(_ => 1).sum(0);
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
    // Arrange
    const query = Reduce.eventsOfType('inc').select(_ => 1).sum(0).select(x => 2 * x);
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
    // Arrange
    const query = Reduce.eventsOfType('inc').select(_ => 1).sum(0);
    const events = [{ type: 'inc' }, { type: 'inc' }, { type: 'inc' }];
    // Act
    const reducer = query.build();
    const {newState, newAuxillary} = reducer.reduce({events});
    // Assert
    expect(newState).to.equal(3); 
  });

  it('should reduce queries containing filters with batches of events', () => {
    // Arrange
    const query = Reduce.eventsOfType('inc').select(e => e.value).where(x => x < 2);
    const events = [{ type: 'inc', value: 1 }, { type: 'inc', value: 2 }];
    // Act
    const reducer = query.build();
    const {newState, newAuxillary} = reducer.reduce({events});
    // Assert
    expect(newState).to.equal(1); 
  });

  it('should reduce queries containing multiple reductions BUT ONLY WHEN SEED ACTS AS ZERO', () => {
    // Arrange
    const query = Reduce.eventsOfType('inc') //       e,       e
                        .select(_ => 1)      //       1,       1
                        .sum(0)              //  (0 + 1), (1 + 1)
                        .sum(0);             //  (0 + 1), (1 + 2)
    const events = [{ type: 'inc' }, { type: 'inc' }];
    // Act
    const reducer = query.build();
    const {newState, newAuxillary} = reducer.reduce({events});
    // Assert
    expect(newState).to.equal(3); 
  });

  it('should reduce to seed values before a matching event occurs', () => {
    // Arrange
    const query = Reduce.allEvents().where(_ => false).sum(10);
    const event = { type: 'inc' };
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce({event});
    // Assert
    expect(newState).to.equal(10); 
  });

  it('should reduce Reduce.never() to undefined', () => {
    // Arrange
    const query = Reduce.never();
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.not.exist;
  });

  it('should reduce reducers', () => {
    // Arrange
    const query = Reduce.value(2).flatReduce(x => Reduce.value(x).map(x => 3 * x));
    // Act
    const reducer = query.build();
    const {newState} = reducer.reduce();
    // Assert
    expect(newState).to.equal(6);
  });

  it('should filter events from parts of the model where they are not in scope', () => {
    // Arrange
    const todo = id => 
      Reduce.structure({
        id: id,
        description: 'my description',
        isCompleted: Reduce.eventsOfType('toggle_completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const staticTodoList = Reduce.structure({
      item1: todo(1),
      item2: todo(2)
    });
    const events = [
      { type: 'toggle_completed', todoId: 2 }
    ];
    // Act
    const reducer = staticTodoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(newState).to.deep.equal({
      item1: {
        id: 1,
        description: 'my description',
        isCompleted: false
      },
      item2: {
        id: 2,
        description: 'my description',
        isCompleted: true
      }
    });
  });

  it('should reduce merge queries when there is only one update', () => {
    // Arrange
    const query = Reduce.merge([
      Reduce.value(10)
    ]);
    // Act
    const store = query.build().toStore();
    const newState = store.getState();
    // Assert
    expect(newState).to.deep.equal([10]);
  });

  it('should reduce merge queries when there are multiple updates at once', () => {
    // Arrange
    const query = Reduce.merge([
      Reduce.eventsOfType('foo').select(_ => 1),
      Reduce.value(10),
      Reduce.eventsOfType('foo').select(_ => 2)
    ]);
    // Act
    const store = query.build().toStore();
    store.dispatch({
      type: 'foo'
    });
    const newState = store.getState();
    // Assert
    expect(newState).to.deep.equal([1, 2]);
  });

  it('should not update reduced merge queries when there are no changes', () => {
    // Arrange
    const query = Reduce.merge([
      Reduce.eventsOfType('foo').select(_ => 1),
      Reduce.value(10),
      Reduce.eventsOfType('foo').select(_ => 2)
    ]);
    // Act
    const store = query.build().toStore();
    store.dispatch({
      type: 'bar'
    });
    const newState = store.getState();
    // Assert
    expect(newState).to.deep.equal([10]);
  });

  it('should not reduce combineLatest queries where an element has never had a value', () => {
    // Arrange
    const query = Reduce.combineLatest([
      Reduce.value(10),
      Reduce.never()
    ]);
    // Act
    const store = query.build().toStore();
    const newState = store.getState();
    // Assert
    expect(newState).to.equal(undefined);
  });

  it('should initially reduce combineLatest queries to an array of the constituents initial values', () => {
    // Arrange
    const query = Reduce.combineLatest([
      Reduce.value(10),
      Reduce.eventsOfType('foo').select(e => e.value)
    ]);
    // Act
    const store = query.build().toStore();
    store.dispatch({
      type: 'foo',
      value: 2
    });
    const newState = store.getState();
    // Assert
    expect(newState).to.deep.equal([10, 2]);
  });

  it('should reduce combineLatest queries to an array of the constituents latest values', () => {
    // Arrange
    const query = Reduce.combineLatest([
      Reduce.value(10),
      Reduce.eventsOfType('foo').select(e => e.value)
    ]);
    // Act
    const store = query.build().toStore();
    store.dispatch({
      type: 'foo',
      value: 2
    });
    store.dispatch({
      type: 'foo',
      value: 4
    });
    const newState = store.getState();
    // Assert
    expect(newState).to.deep.equal([10, 4]);
  });
});