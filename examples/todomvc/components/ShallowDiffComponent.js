import React, { Component } from 'react';

/**
 * A component that only updates if one or more of its properties have changed.
 */
export default class ShallowDiffComponent extends Component {
  constructor(props, context) {
    super(props, context);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true; //this._hasChanged(this.props, nextProps) || this._hasChanged(this.state, nextState);
  }

  _hasChanged(thisObj, thatObj) {
    if (thisObj === thatObj) return false;
    const thatObjKeys = Object.keys(thatObj);
    const thisObjKeys = Object.keys(thisObj);
    return thisObjKeys.length !== thatObjKeys.length
        || thisObjKeys.some(k => thatObjKeys[k] !== thisObjKeys[k]);
  }
}