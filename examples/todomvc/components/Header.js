import React, { PropTypes, Component } from 'react';
import cuid from 'cuid';
import TodoTextInput from './TodoTextInput';
import {TODO_ADDED} from '../constants/EventTypes';

export default class Header extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleSave = this.handleSave.bind(this);
  }

  handleSave(text) {
    if (text.length !== 0) {
      const todoId = cuid();
      this.props.dispatch({type: TODO_ADDED, text, todoId});
    }
  }

  render() {
    return (
      <header className="header">
          <h1>todos</h1>
          <TodoTextInput isNewTodo
                         onSave={this.handleSave}
                         placeholder="What needs to be done?" />
      </header>
    );
  }
}

Header.propTypes = {
  dispatch: PropTypes.func.isRequired
};