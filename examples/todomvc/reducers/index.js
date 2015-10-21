import Reduce, {Deltas} from 'requex';
import * as Events from '../constants/EventTypes';
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters';

const performFilter = {
  [SHOW_ALL]: todos => todos,
  [SHOW_ACTIVE]: todos => todos.filter(todo => !todo.isCompleted),
  [SHOW_COMPLETED]: todos => todos.filter(todo => todo.isCompleted)
};

const todo = (id, text) => Reduce.structure({
  id,
  isCompleted: Reduce.eventsOfType(Events.COMPLETION_CHANGED)
                     .select(e => e.isCompleted),
  text: Reduce.eventsOfType(Events.TODO_EDITED)
              .fold((_, e) => e.text, text)
}).scoped(e => e.todoId === undefined || e.todoId === id);

const todos = Reduce.arrayOf({
  itemFactory: e => todo(e.todoId, e.text),
  deltas: [
    // Clearings
    Reduce.eventsOfType(Events.COMPLETED_TODOS_CLEARED)
          .select(e => e.completedTodoIds.map(Deltas.removed)),
    // Removals
    Reduce.eventsOfType(Events.TODO_DELETED)
          .select(e => Deltas.removed(e.todoId)),
    // Additions
    Reduce.eventsOfType(Events.TODO_ADDED)
          .select(e => Deltas.added(e.todoId, e))
  ]
});

export default Reduce.structure({
  todos,
  filter: Reduce.eventsOfType(Events.FILTER_CHANGED)
                .fold((_, e) => e.filter, SHOW_ALL)
}).map(({todos, filter}) => {
  const completedCount = todos.reduce((acc, todo) => todo.isCompleted ? acc + 1 : acc, 0);
  const activeCount = todos.length - completedCount;
  return {
    todos,
    filter,
    filteredTodos: performFilter[filter](todos),
    completedCount,
    activeCount
  };
});