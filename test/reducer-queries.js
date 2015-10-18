import chai from 'chai';
import Reduce, {LinkedList} from '../src/index.js';

const expect = chai.expect;

describe('Reducer queries', () => {

  // Query reducing...

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

  // it('should reduce maps from single add deltas', () => {
  //   // Arrange
  //   const query = Reduce.eventsOfType('add-todo')
  //                       .map(e => ({ added: [[e.todoId, e.title]] }))
  //                       .toDictionary();
  //   // Act
  //   const reducer = query.build();
  //   const events = [
  //     { type: 'add-todo', todoId: 40, title: 'Pick up milk' },
  //     { type: 'add-todo', todoId: 42, title: 'Buy the paper' }
  //   ];
  //   const {newState} = reducer.reduce({events});
  //   // Assert
  //   expect(newState).to.deep.equal({
  //     [40]: 'Pick up milk',
  //     [42]: 'Buy the paper'
  //   });
  // });

  // it('should reduce maps from multiple add deltas', () => {
  //   // Arrange
  //   const query = Reduce.eventsOfType('add-todo')
  //                       .map(e => ({ added: [[e.todoId, e.title], [e.todoId * 2, e.title]] }))
  //                       .toDictionary();
  //   // Act
  //   const reducer = query.build();
  //   const events = [
  //     { type: 'add-todo', todoId: 40, title: 'Pick up milk' },
  //     { type: 'add-todo', todoId: 42, title: 'Buy the paper' }
  //   ];
  //   const {newState} = reducer.reduce({events});
  //   // Assert
  //   expect(newState).to.deep.equal({
  //     [40]: 'Pick up milk',
  //     [80]: 'Pick up milk',
  //     [42]: 'Buy the paper',
  //     [84]: 'Buy the paper'
  //   });
  // });

  // it('should initialize maps to their seeds if provided', () => {
  //   // Arrange
  //   const query = Reduce.never()
  //                       .toDictionary({
  //                         foo: 'bar'
  //                       });
  //   // Act
  //   const reducer = query.build();
  //   const {newState} = reducer.reduce();
  //   // Assert
  //   expect(newState).to.deep.equal({
  //     foo: 'bar'
  //   });
  // });

  // it('should reduce maps from single remove deltas', () => {
  //   // Arrange
  //   const query = Reduce.eventsOfType('remove-todo')
  //                       .map(e => ({ removed: [e.todoId] }))
  //                       .toDictionary({
  //                         [40]: 'Pick up milk',
  //                         [42]: 'Buy the paper'
  //                       });
  //   const events = [
  //     { type: 'remove-todo', todoId: 40 }
  //   ];
  //   // Act
  //   const reducer = query.build();
  //   const {newState} = reducer.reduce({events});
  //   // Assert
  //   expect(newState).to.deep.equal({
  //     [42]: 'Buy the paper'
  //   });
  // });

  // it('should reduce maps from multiple remove deltas', () => {
  //   // Arrange
  //   const query = Reduce.eventsOfType('remove-todos')
  //                       .map(e => ({ removed: e.todoIds }))
  //                       .toDictionary({
  //                         '40': 'Pick up milk',
  //                         '42': 'Buy the paper'
  //                       });
  //   const events = [
  //     { type: 'remove-todos', todoIds: [40, 42] }
  //   ];
  //   // Act
  //   const reducer = query.build();
  //   const {newState} = reducer.reduce({events});
  //   // Assert
  //   expect(newState).to.deep.equal({});
  // });

  // it('should reduce linked lists from add deltas and preserve order', () => {
  //   // Arrange
  //   const query = Reduce.eventsOfType('add-todo')
  //                       .map(e => ({ added: [{ id: e.todoId, title: e.title}] }))
  //                       .toLinkedList();
  //   // Act
  //   const reducer = query.build();
  //   const events = [
  //     { type: 'add-todo', todoId: 40, title: 'Pick up milk' },
  //     { type: 'add-todo', todoId: 42, title: 'Buy the paper' }
  //   ];
  //   const {newState} = reducer.reduce({events});
  //   // Assert
  //   expect(LinkedList.toArray(newState)).to.deep.equal([
  //     {id: 40, title: 'Pick up milk'},
  //     {id: 42, title: 'Buy the paper'}
  //   ]);
  // });

  // it('should initialize linked lists to their seeds if provided', () => {
  //   // Arrange
  //   const query = Reduce.never()
  //                       .toLinkedList(['foo']);
  //   // Act
  //   const reducer = query.build();
  //   const {newState} = reducer.reduce();
  //   // Assert
  //   expect(LinkedList.toArray(newState)).to.deep.equal(['foo']);
  // });

  // it('should reduce linked lists from remove deltas', () => {
  //   // Arrange
  //   const query = Reduce.eventsOfType('remove-todo')
  //                       .map(e => e.todoId)
  //                       .map(todoId => ({ removed: [todoId] }))
  //                       .toLinkedList([{id: 20}, {id: 40}, {id: 80}], item => item.id);
  //   // Act
  //   const reducer = query.build();
  //   const events = [
  //     { type: 'remove-todo', todoId: 40 },
  //   ];
  //   const {newState} = reducer.reduce({events});
  //   // Assert
  //   expect(LinkedList.toArray(newState)).to.deep.equal([{id: 20}, {id: 80}]);
  // });

  it('should handle single additions of reducer structures to linked lists', () => {
    // Arrange
    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const todoList =
      Reduce.linkedListOf({
        additions: Reduce.eventsOfType('add-todo'),
        removals: Reduce.eventsOfType('remove-todo').map(e => e.todoId),
        itemFactory: e => todo(e.todoId, e.description),
        itemKey: todo => todo.id
      });
    const events = [
      { type: 'add-todo', todoId: 1, description: 'foo' },
      { type: 'add-todo', todoId: 2, description: 'bar' },
      { type: 'toggle-completed', todoId: 2 },
      { type: 'add-todo', todoId: 3, description: 'barf' },
      { type: 'remove-todo', todoId: 2},
      { type: 'toggle-completed', todoId: 3 },
    ];
    // Act
    const reducer = todoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(LinkedList.toArray(newState)).to.deep.equal([
      {
        id: 1,
        description: 'foo',
        isCompleted: false
      },
      {
        id: 3,
        description: 'barf',
        isCompleted: true
      }
    ]);
  });

  it('should handle multiple additions of reducer structures to linked lists', () => {
    // Arrange
    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const todoList =
      Reduce.linkedListOf({
        additions: Reduce.eventsOfType('add-todo').map(e => e.todos),
        itemFactory: e => todo(e.todoId, e.description),
        itemKey: todo => todo.id
      });
    const events = [
      { type: 'add-todo', todos: [{todoId: 1, description: 'foo'}, {todoId: 2, description: 'bar'}] },
      { type: 'toggle-completed', todoId: 2 },
    ];
    // Act
    const reducer = todoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(LinkedList.toArray(newState)).to.deep.equal([
      {
        id: 1,
        description: 'foo',
        isCompleted: false
      },
      {
        id: 2,
        description: 'bar',
        isCompleted: true
      }
    ]);
  });

  it('should handle single removals of reducer structures from linked lists', () => {
    // Arrange
    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const todoList =
      Reduce.linkedListOf({
        additions: Reduce.eventsOfType('add-todo'),
        removals: Reduce.eventsOfType('remove-todo').map(e => e.todoId),
        itemFactory: e => todo(e.todoId, e.description),
        itemKey: todo => todo.id
      });
    const events = [
      { type: 'add-todo', todoId: 1, description: 'foo' },
      { type: 'add-todo', todoId: 2, description: 'bar' },
      { type: 'remove-todo', todoId: 2}
    ];
    // Act
    const reducer = todoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(LinkedList.toArray(newState)).to.deep.equal([
      {
        id: 1,
        description: 'foo',
        isCompleted: false
      }
    ]);
  });

  it('should handle multiple removals of reducer structures from linked lists', () => {
    // Arrange
    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const todoList =
      Reduce.linkedListOf({
        additions: Reduce.eventsOfType('add-todo'),
        removals: Reduce.eventsOfType('remove-todo').map(e => e.todoIds),
        itemFactory: e => todo(e.todoId, e.description),
        itemKey: todo => todo.id
      });
    const events = [
      { type: 'add-todo', todoId: 1, description: 'foo' },
      { type: 'add-todo', todoId: 2, description: 'bar' },
      { type: 'remove-todo', todoIds: [2, 1] }
    ];
    // Act
    const reducer = todoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(LinkedList.toArray(newState)).to.deep.equal([]);
  });

it('should handle single additions of constant values to linked lists', () => {
    // Arrange
    const todoList =
      Reduce.linkedListOf({
        additions: Reduce.eventsOfType('add-todo'),
        removals: Reduce.eventsOfType('remove-todo').map(e => e.todoId),
        itemFactory: e => ({ id: e.todoId, description: e.description }),
        itemKey: todo => todo.id
      });
    const events = [
      { type: 'add-todo', todoId: 1, description: 'foo' },
      { type: 'add-todo', todoId: 2, description: 'bar' }
    ];
    // Act
    const reducer = todoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(LinkedList.toArray(newState)).to.deep.equal([
      {
        id: 1,
        description: 'foo'
      },
      {
        id: 2,
        description: 'bar'
      }
    ]);
  });

  it('should handle multiple additions of constant values to linked lists', () => {
    // Arrange
    const todoList =
      Reduce.linkedListOf({
        additions: Reduce.eventsOfType('add-todo').map(e => e.todos),
        itemFactory: todo => todo,
        itemKey: todo => todo.id
      });
    const events = [
      { type: 'add-todo', todos: [{id: 1, description: 'foo'}, {id: 2, description: 'bar'}] },
      { type: 'toggle-completed', todoId: 2 },
    ];
    // Act
    const reducer = todoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(LinkedList.toArray(newState)).to.deep.equal([
      {
        id: 1,
        description: 'foo'
      },
      {
        id: 2,
        description: 'bar'
      }
    ]);
  });

  it('should handle single removals of constant values from linked lists', () => {
    // Arrange
    const todoList =
      Reduce.linkedListOf({
        additions: Reduce.eventsOfType('add-todo'),
        removals: Reduce.eventsOfType('remove-todo').map(e => e.todoId),
        itemFactory: e => ({ id: e.todoId, description: e.description }),
        itemKey: todo => todo.id
      });
    const events = [
      { type: 'add-todo', todoId: 1, description: 'foo' },
      { type: 'add-todo', todoId: 2, description: 'bar' },
      { type: 'remove-todo', todoId: 2}
    ];
    // Act
    const reducer = todoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(LinkedList.toArray(newState)).to.deep.equal([
      {
        id: 1,
        description: 'foo'
      }
    ]);
  });

  it('should handle multiple removals of constant values from linked lists', () => {
    // Arrange
    const todoList =
      Reduce.linkedListOf({
        additions: Reduce.eventsOfType('add-todo'),
        removals: Reduce.eventsOfType('remove-todo').map(e => e.todoIds),
        itemFactory: e => ({ id: e.todoId, description: e.description }),
        itemKey: todo => todo.id
      });
    const events = [
      { type: 'add-todo', todoId: 1, description: 'foo' },
      { type: 'add-todo', todoId: 2, description: 'bar' },
      { type: 'remove-todo', todoIds: [1, 2]}
    ];
    // Act
    const reducer = todoList.build();
    const {newState} = reducer.reduce({events});
    // Assert
    expect(LinkedList.toArray(newState)).to.deep.equal([]);
  });
});