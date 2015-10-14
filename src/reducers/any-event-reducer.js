import Reducer from './reducer.js';

export default class AnyEventReducer {
  getNext(context) {
    return context.events;
  }
}