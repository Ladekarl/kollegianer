import React, {Component} from 'react';
import {TextInput} from 'react-native';

export default class AutoExpandingTextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {text: '', height: 0};
  }

  _onContentSizeChanged = (event) => {
    this.setState({
      height: event.nativeEvent.contentSize.height,
    })
  };

  render() {
    return (
      <TextInput
        {...this.props}
        multiline={true}
        onContentSizeChange={this._onContentSizeChanged}
        style={[this.props.style, {height: Math.max(32, this.state.height)}]}
      />
    );
  }
}