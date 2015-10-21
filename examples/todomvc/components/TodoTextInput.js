import React, { PropTypes, Component } from 'react';
import ShallowDiffComponent from './ShallowDiffComponent';
import classnames from 'classnames';

class TodoTextInput extends ShallowDiffComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      text: this.props.text || ''
    };
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    const text = e.target.value.trim();
    if (e.which === 13) {
      this.props.onSave(text);
      if (this.props.isNewTodo) {
        this.setState({ text: '' });
      }
    }
  }

  handleChange(e) {
    this.setState({ text: e.target.value });
  }

  handleBlur(e) {
    if (!this.props.isNewTodo) {
      this.props.onSave(e.target.value);
    }
  }

  render() {
    return (
      <input className={
        classnames({
          edit: this.props.isEditing,
          'new-todo': this.props.isNewTodo
        })}
        type="text"
        placeholder={this.props.placeholder}
        autoFocus="true"
        value={this.state.text}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onKeyDown={this.handleSubmit} />
    );
  }
}

TodoTextInput.propTypes = {
  onSave: PropTypes.func.isRequired,
  text: PropTypes.string,
  placeholder: PropTypes.string,
  isEditing: PropTypes.bool,
  isNewTodo: PropTypes.bool
};

export default TodoTextInput;
