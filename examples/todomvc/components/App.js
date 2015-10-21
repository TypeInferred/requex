import React, {Component} from 'react';
import Header from '../components/Header';
import MainSection from '../components/MainSection';
import configureStore from '../store/configureStore.js';

export default class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.store = configureStore();
  }

  componentWillMount() {
    // Update the state on each frame.
    this.canPoll = true;
    let lastState;
    const pollStateWhileMounted = () => {
      if (this.canPoll) {
        const newState = this.store.getState();
        if (lastState !== newState) {
          lastState = newState;
          this.setState(newState);
        }
        window.requestAnimationFrame(() => pollStateWhileMounted());
      }
    };
    pollStateWhileMounted();
  }

  componentWillUnmount() {
    this.canPoll = false;
  }

  render() {
    return (
      <div>
        <Header dispatch={this.store.dispatch} />
        <MainSection todos={this.state.todos}
                     filteredTodos={this.state.filteredTodos}
                     filter={this.state.filter}
                     activeCount={this.state.activeCount}
                     completedCount={this.state.completedCount}
                     dispatch={this.store.dispatch} />
      </div>
    );
  }
}