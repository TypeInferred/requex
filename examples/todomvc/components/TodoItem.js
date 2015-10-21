import React, { PropTypes } from 'react';
import ShallowDiffComponent from './ShallowDiffComponent';
import classnames from 'classnames';
import { COMPLETION_CHANGED, TODO_DELETED, TODO_EDITED } from '../constants/EventTypes';
import TodoTextInput from './TodoTextInput';

export default class TodoItem extends ShallowDiffComponent {
  constructor(props, context) {
    super(props, context);
    this.handleStartEditing = this.handleStartEditing.bind(this);
    this.handleToggleCompleted = this.handleToggleCompleted.bind(this);
    this.handleDeleted = this.handleDeleted.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.state = {
      isEditing: false
    };
  }

  handleStartEditing() {
    this.setState({ isEditing: true });
  }

  handleToggleCompleted() {
    const { dispatch, todo } = this.props;
    dispatch({
      type: COMPLETION_CHANGED,
      todoId: todo.id,
      isCompleted: !todo.isCompleted
    });
  }

  handleDeleted() {
    const { dispatch, todo } = this.props;
    dispatch({
      type: TODO_DELETED,
      todoId: todo.id
    });
  }

  handleEdited(text) {
    const { dispatch, todo } = this.props;
    dispatch({
      type: TODO_EDITED,
      todoId: todo.id,
      text
    });
  }

  handleSave(text) {
    if (text.length === 0) {
      this.handleDeleted();
    } else {
      this.handleEdited(text);
    }
    this.setState({ isEditing: false });
  }

  render() {
    const {todo, completeTodo, deleteTodo} = this.props;

    let element;
    if (this.state.isEditing) {
      element = (
        <TodoTextInput text={todo.text}
                       isEditing={this.state.isEditing}
                       onSave={this.handleSave} />
      );
    } else {
      element = (
        <div className="view">
          <input className="toggle"
                 type="checkbox"
                 checked={todo.isCompleted}
                 onChange={this.handleToggleCompleted} />
          <label onDoubleClick={this.handleStartEditing}>
            {todo.text}
          </label>
          <button className="destroy"
                  onClick={this.handleDeleted} />
        </div>
      );
    }

    return (
      <li className={classnames({
        completed: todo.isCompleted,
        editing: this.state.isEditing
      })}>
        {element}
      </li>
    );
  }
}

TodoItem.propTypes = {
  todo: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};
