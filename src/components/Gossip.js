import React, {Component} from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Text,
  Keyboard
} from 'react-native';
import Icon from 'react-native-fa-icons';
import colors from '../shared/colors';
import AutoExpandingTextInput from './AutoExpandingTextInput';
import Database from "../storage/Database";

export default class GossipScreen extends Component {

  static navigationOptions = {
    tabBarLabel: 'Gossip',
    tabBarIcon: ({tintColor}) => (<Icon name='heartbeat' style={{fontSize: 25, color: tintColor}}/>),
  };

  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      renderMessages: [],
      messages: [],
      message: ''
    };
  }

  componentDidMount() {
    this.setState({fetching: true});
    Database.listenGossip(snapshot => {
      this.messages = snapshot;
      this.setState({
        renderMessages: this.renderMessages(),
        fetching: false
      });
      this.scrollView.scrollToEnd({animated: true});
    }).catch(error => {
      this.setState({fetching: false});
    });
  }

  componentWillUnmount() {
    Database.unListenGossip();
  }

  renderMessages = () => {
    let renderMessages = [];
    this.messages.forEach(message => {
      renderMessages.push(this._renderMessage(message));
    });
    return renderMessages;
  };

  _renderMessage = (renderMessage) => {
    const message = renderMessage.val();
    return (
      <View
        key={renderMessage.key}
        style={styles.columnContainer}
      >
        <Text style={styles.dateText}>{message.date}</Text>
        <View
          style={styles.rowContainer}>
          <Icon name='user-circle' style={styles.rowImage}/>
          <Text style={styles.messageText}>{message.message}</Text>
        </View>
      </View>
    );
  };

  onMessageChange = (message) => {
    this.setState({message});
  };

  submitMessage = () => {
    if (this.state.message) {
      let date = new Date();
      let newMessage = {
        message: this.state.message,
        date: `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}`
      };
      Database.addGossip(newMessage);
      this.setState({message: ''});
      Keyboard.dismiss();
    }
  };

  updateMessages = () => {
    this.setState({fetching: true});
    Database.getGossip().then((snapshot) => {
      this.messages = snapshot;
      this.setState({
        renderMessages: this.renderMessages(),
        fetching: false
      });
    }).catch((error) => {
      this.setState({fetching: false});
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.fetching}
              onRefresh={this.updateMessages}
            />
          }
          contentContainerStyle={styles.scrollContainer}
          ref={ref => this.scrollView = ref}
          onContentSizeChange={(contentWidth, contentHeight) => {
            this.scrollView.scrollToEnd({animated: true});
          }}>
          <View style={styles.messageContainer}>
            {this.state.renderMessages}
          </View>
        </ScrollView>
        <View style={styles.footerContainer}>
          <View style={styles.newMessageContainer}>
            <AutoExpandingTextInput
              style={styles.newMessageInput}
              placeholder='Aa'
              value={this.state.message}
              underlineColorAndroid='transparent'
              selectionColor={colors.overviewIconColor}
              textAlignVertical='bottom'
              onChangeText={this.onMessageChange}/>
          </View>
          <TouchableOpacity style={styles.rowImageContainer} onPress={this.submitMessage}>
            <Icon name='send' style={{fontSize: 20, color: 'black'}}/>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: colors.backgroundColor,
  },
  scrollContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  messageContainer: {
    width: '100%',
    justifyContent: 'space-between'
  },
  rowImageContainer: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 10,
    justifyContent: 'flex-end'
  },
  rowContainer: {
    flexDirection: 'row',
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    padding: 5,
    borderRadius: 5
  },
  columnContainer: {
    flexDirection: 'column'
  },
  footerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 60,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 5,
    marginBottom: 5
  },
  newMessageContainer: {
    flex: 7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  dateText: {
    alignSelf: 'center'
  },
  messageText: {
    padding: 5,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
    fontSize: 16,
    marginBottom: 2,
    maxWidth: '90%',
    textAlign: 'left',
    backgroundColor: colors.modalBackgroundColor,
    borderWidth: StyleSheet.hairlineWidth
  },
  newMessageInput: {
    flex: 1,
    fontSize: 16,
    textAlign: 'left',
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 15,
    paddingRight: 15
  },
  rowImage: {
    fontSize: 25,
    color: 'black',
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 3,
    alignSelf: 'flex-end'
  }
});