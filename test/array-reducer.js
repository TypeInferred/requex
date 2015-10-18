import chai from 'chai';
import Reduce from '../src/index.js';

const expect = chai.expect;

describe('Reduce.arrayOf(...)', () => {

  it('should handle single additions of reducer structures', () => {
    // Arrange
    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const todoList =
      Reduce.arrayOf({
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
    expect(newState).to.deep.equal([
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

  it('should handle multiple additions of reducer structures', () => {
    // Arrange
    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const todoList =
      Reduce.arrayOf({
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
    expect(newState).to.deep.equal([
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

  it('should handle single removals of reducer structures', () => {
    // Arrange
    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const todoList =
      Reduce.arrayOf({
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
    expect(newState).to.deep.equal([
      {
        id: 1,
        description: 'foo',
        isCompleted: false
      }
    ]);
  });

  it('should handle multiple removals of reducer structures', () => {
    // Arrange
    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);
    const todoList =
      Reduce.arrayOf({
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
    expect(newState).to.deep.equal([]);
  });

it('should handle single additions of constant values', () => {
    // Arrange
    const todoList =
      Reduce.arrayOf({
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
    expect(newState).to.deep.equal([
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

  it('should handle multiple additions of constant values', () => {
    // Arrange
    const todoList =
      Reduce.arrayOf({
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
    expect(newState).to.deep.equal([
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

  it('should handle single removals of constant values', () => {
    // Arrange
    const todoList =
      Reduce.arrayOf({
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
    expect(newState).to.deep.equal([
      {
        id: 1,
        description: 'foo'
      }
    ]);
  });

  it('should handle multiple removals of constant values', () => {
    // Arrange
    const todoList =
      Reduce.arrayOf({
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
    expect(newState).to.deep.equal([]);
  });
});