import chai from 'chai';
import Reduce, {Deltas} from '../src/index.js';

const expect = chai.expect;

const describeCollection = (name, reduceCollection, adjustExpectation) => {
  describe(`Collections - Reduce.${name}(...)`, () => {

    const todo = (id, description) => 
      Reduce.structure({
        id: id,
        description: description,
        isCompleted: Reduce.eventsOfType('toggle-completed')
                           .fold((isCompleted, _) => !isCompleted, false)
      }).scoped(e => !e.todoId || e.todoId === id);

    const todoList =
      reduceCollection({
        itemFactory: e => todo(e.todoId, e.description),
        deltas: [
          Reduce.eventsOfType('add-todo').select(e => Deltas.added(e.todoId, e)),
          Reduce.eventsOfType('add-todos').select(e => e.todos.map(todo => Deltas.added(todo.todoId, todo))),
          Reduce.eventsOfType('remove-todo').map(e => Deltas.removed(e.todoId)),
          Reduce.eventsOfType('remove-todos').map(e => e.todoIds.map(Deltas.removed))
        ]
      });

    it('should handle single additions of reducer structures', () => {
      // Arrange
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
      expect(newState).to.deep.equal(adjustExpectation([
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
      ]));
    });

    it('should handle multiple additions of reducer structures', () => {
      // Arrange
      const events = [
        { type: 'add-todos', todos: [{todoId: 1, description: 'foo'}, {todoId: 2, description: 'bar'}] },
        { type: 'toggle-completed', todoId: 2 },
      ];
      // Act
      const reducer = todoList.build();
      const {newState} = reducer.reduce({events});
      // Assert
      expect(newState).to.deep.equal(adjustExpectation([
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
      ]));
    });

    it('should handle single removals of reducer structures', () => {
      // Arrange
      const events = [
        { type: 'add-todo', todoId: 1, description: 'foo' },
        { type: 'add-todo', todoId: 2, description: 'bar' },
        { type: 'remove-todo', todoId: 2}
      ];
      // Act
      const reducer = todoList.build();
      const {newState} = reducer.reduce({events});
      // Assert
      expect(newState).to.deep.equal(adjustExpectation([
        {
          id: 1,
          description: 'foo',
          isCompleted: false
        }
      ]));
    });

    it('should handle multiple removals of reducer structures', () => {
      // Arrange
      const events = [
        { type: 'add-todo', todoId: 1, description: 'foo' },
        { type: 'add-todo', todoId: 2, description: 'bar' },
        { type: 'remove-todos', todoIds: [2, 1] }
      ];
      // Act
      const reducer = todoList.build();
      const {newState} = reducer.reduce({events});
      // Assert
      expect(newState).to.deep.equal(adjustExpectation([]));
    });

  const constTodoList =
    reduceCollection({
      itemFactory: todo => ({id: todo.todoId, description: todo.description}),
      deltas: [
        Reduce.eventsOfType('add-todo').select(e => Deltas.added(e.todoId, e)),
        Reduce.eventsOfType('add-todos').select(e => e.todos.map(todo => Deltas.added(todo.todoId, todo))),
        Reduce.eventsOfType('remove-todo').map(e => Deltas.removed(e.todoId)),
        Reduce.eventsOfType('remove-todos').map(e => e.todoIds.map(Deltas.removed))
      ]
    });

  it('should handle single additions of constant values', () => {
      // Arrange
      const events = [
        { type: 'add-todo', todoId: 1, description: 'foo' },
        { type: 'add-todo', todoId: 2, description: 'bar' }
      ];
      // Act
      const reducer = constTodoList.build();
      const {newState} = reducer.reduce({events});
      // Assert
      expect(newState).to.deep.equal(adjustExpectation([
        {
          id: 1,
          description: 'foo'
        },
        {
          id: 2,
          description: 'bar'
        }
      ]));
    });

    it('should handle multiple additions of constant values', () => {
      // Arrange
      const events = [
        { type: 'add-todos', todos: [{todoId: 1, description: 'foo'}, {todoId: 2, description: 'bar'}] },
        { type: 'toggle-completed', todoId: 2 },
      ];
      // Act
      const reducer = constTodoList.build();
      const {newState} = reducer.reduce({events});
      // Assert
      expect(newState).to.deep.equal(adjustExpectation([
        {
          id: 1,
          description: 'foo'
        },
        {
          id: 2,
          description: 'bar'
        }
      ]));
    });

    it('should handle single removals of constant values', () => {
      // Arrange
      const events = [
        { type: 'add-todo', todoId: 1, description: 'foo' },
        { type: 'add-todo', todoId: 2, description: 'bar' },
        { type: 'remove-todo', todoId: 2}
      ];
      // Act
      const reducer = constTodoList.build();
      const {newState} = reducer.reduce({events});
      // Assert
      expect(newState).to.deep.equal(adjustExpectation([
        {
          id: 1,
          description: 'foo'
        }
      ]));
    });

    it('should handle multiple removals of constant values', () => {
      // Arrange
      const events = [
        { type: 'add-todo', todoId: 1, description: 'foo' },
        { type: 'add-todo', todoId: 2, description: 'bar' },
        { type: 'remove-todos', todoIds: [1, 2]}
      ];
      // Act
      const reducer = constTodoList.build();
      const {newState} = reducer.reduce({events});
      // Assert
      expect(newState).to.deep.equal(adjustExpectation([]));
    });
  });
};

describeCollection('arrayOf', Reduce.arrayOf, xs => xs);
describeCollection('dictionaryObjectOf', Reduce.dictionaryObjectOf, xs => xs.reduce((acc, x) => {
  acc[x.id] = x;
  return acc;
}, {}));
