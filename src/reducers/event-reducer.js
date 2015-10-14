import Reducer from './reducer.js';

export default class EventReducer extends Reducer {
  constructor(eventType) {
    super();
    this.eventType = eventType;
  }

  getNext(context) {
    return context.events.filter(([eventNumber, e]) => e.type === this.eventType);
  }
}