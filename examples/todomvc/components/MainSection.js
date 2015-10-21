import React, { PropTypes } from 'react';
import ShallowDiffComponent from './ShallowDiffComponent';
import TodoItem from './TodoItem';
import Footer from './Footer';
import { COMPLETION_CHANGED } from '../constants/EventTypes';

export default class MainSection extends ShallowDiffComponent {
  constructor(props, context) {
    super(props, context);
    this.handleToggleAll = this.handleToggleAll.bind(this);
  }

  handleToggleAll(e) {
    const { dispatch, activeCount } = this.props;
    dispatch({
      type: COMPLETION_CHANGED,
      isCompleted: activeCount > 0
    });
  }

  renderToggleAll() {
    const { todos, completedCount } = this.props;

    if (todos.length) {
      return (
        <input className="toggle-all"
               type="checkbox"
               checked={completedCount === todos.length}
               onChange={this.handleToggleAll} />
      );
    }
  }

  renderFooter() {
    const { todos, activeCount, filter, completedCount, dispatch} = this.props;

    if (todos.length) {
      return (
        <Footer activeCount={activeCount}
                completedCount={completedCount}
                filter={filter}
                dispatch={dispatch} />
      );
    }
  }

  render() {
    const { filteredTodos, dispatch } = this.props;
    console.log(filteredTodos);
    return (
      <section className="main">
        {this.renderToggleAll()}
        <ul className="todo-list">
          {filteredTodos.map(todo =>
            <TodoItem key={todo.id} todo={todo} dispatch={dispatch} />
          )}
        </ul>
        {this.renderFooter()}
      </section>
    );
  }
}

MainSection.propTypes = {
  todos: PropTypes.array.isRequired,
  filteredTodos: PropTypes.array.isRequired,
  filter: PropTypes.string.isRequired,
  activeCount: PropTypes.number.isRequired,
  completedCount: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired
};
