import React, { PropTypes } from 'react';
import ShallowDiffComponent from './ShallowDiffComponent';
import classnames from 'classnames';
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters';
import { FILTER_CHANGED, COMPLETED_TODOS_CLEARED } from '../constants/EventTypes';

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed'
};

export default class Footer extends ShallowDiffComponent {
  constructor(props, context) {
    super(props, context);
    this.handleClearCompleted = this.handleClearCompleted.bind(this);
  }

  handleFilterChanged(filter) {
    const { dispatch } = this.props;
    dispatch({
      type: FILTER_CHANGED,
      filter
    });
  }

  handleClearCompleted() {
    const { todos, dispatch } = this.props;
    dispatch({ 
      type: COMPLETED_TODOS_CLEARED,
      completedTodoIds: todos.filter(todo => todo.isCompleted).map(todo => todo.id)
    });
  }

  renderTodoCount() {
    const { activeCount } = this.props;
    const itemWord = activeCount === 1 ? 'item' : 'items';

    return (
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
    );
  }

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter];
    const { filter: selectedFilter, onShow } = this.props;

    return (
      <a className={classnames({ selected: filter === selectedFilter })}
         style={{ cursor: 'pointer' }}
         onClick={() => this.handleFilterChanged(filter)}>
        {title}
      </a>
    );
  }

  renderClearButton() {
    const { completedCount } = this.props;
    if (completedCount > 0) {
      return (
        <button className="clear-completed"
                onClick={this.handleClearCompleted} >
          Clear completed
        </button>
      );
    }
  }

  render() {
    return (
      <footer className="footer">
        {this.renderTodoCount()}
        <ul className="filters">
          {[SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map(filter =>
            <li key={filter}>
              {this.renderFilterLink(filter)}
            </li>
          )}
        </ul>
        {this.renderClearButton()}
      </footer>
    );
  }
}

Footer.propTypes = {
  todos: PropTypes.array.isRequired,
  activeCount: PropTypes.number.isRequired,
  completedCount: PropTypes.number.isRequired,
  filter: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired
};
