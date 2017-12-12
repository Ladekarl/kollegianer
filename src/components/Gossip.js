import React, {Component} from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  ActivityIndicator,
  Keyboard,
  Platform
} from 'react-native';
import Icon from 'react-native-fa-icons';
import colors from '../shared/colors';
import AutoExpandingTextInput from './AutoExpandingTextInput';
import Database from '../storage/Database';
import ImagePicker from 'react-native-image-picker';
import Guid from '../shared/Guid';
import FitImage from 'react-native-fit-image';

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
      message: '',
      loading: false
    };
    this.initialLimit = 20;
    this.limit = this.initialLimit;
    this.messagesUpdated = false;
  }

  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentDidMount() {
    this.setState({fetching: true});
    Database.listenGossip(this.initialLimit, snapshot => {
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
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow = () => {
    this.scrollView.scrollToEnd({animated: true});
  };

  _keyboardDidHide = () => {
    this.scrollView.scrollToEnd({animated: true});
  };

  renderMessages = () => {
    let renderMessages = [];
    this.messages.forEach(message => {
      renderMessages.push(this._renderMessage(message));
    });
    return renderMessages;
  };

  _renderMessage = (renderMessage) => {
    const message = renderMessage.val();
    if(!message.photo) {
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
    } else {
      return (
        <View
          key={renderMessage.key}
          style={styles.columnContainer}
        >
          <Text style={styles.dateText}>{message.date}</Text>
          <View
            style={styles.rowContainer}>
            <Icon name='user-circle' style={styles.rowImage}/>
            <FitImage
              resizeMode='contain'
              style={styles.messageImage}
              source={{uri: message.photo}}
            />
          </View>
        </View>
      );
    }
  };

  onMessageChange = (message) => {
    this.setState({message});
  };

  submitMessage = () => {
    if (this.state.message) {
      let date = this._formatDate();
      let newMessage = {
        message: this.state.message,
        date: date
      };
      Database.addGossip(newMessage);
      this.setState({message: ''});
      Keyboard.dismiss();
    }
  };

  submitPhotoMessage = (photoName) => {
    let date = this._formatDate();
    let newMessage = {
      message: '',
      date: date,
      photo: photoName
    };
    Keyboard.dismiss();
    Database.addGossip(newMessage).finally(() => {
      this.setState({loading: false});
    });
  };

  selectImage = () => {
    Keyboard.dismiss();
    const options = {
      title: 'Vælg et billede',
      mediaType: 'photo',
      quality: 0
    };
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);
      if (!response.error && !response.didCancel) {
        const photoPath = response.uri;
        const uploadUri = Platform.OS === 'ios' ? photoPath.replace('file://', '') : photoPath;
        this.setState({loading: true});
        Database.addGossipImage(uploadUri, Guid()).then((snapshot) => {
          this.submitPhotoMessage(snapshot.downloadURL);
        }).catch(() => {
          this.setState({loading: false});
        });
      }
    });
  };

  _formatDate = () => {
    let d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      hour = '' + d.getHours(),
      minute = '' + d.getMinutes();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (minute.length < 2) minute = '0' + minute;

    return `${day}/${month} ${hour}:${minute}`;
  };

  updateMessages = () => {
    this.setState({fetching: true});
    this.limit = this.limit * 2;
    Database.getGossip(this.limit).then((snapshot) => {
      this.messages = snapshot;
      let renderMessages = this.renderMessages();
      if(renderMessages.length > this.state.renderMessages.length) {
        this.messagesUpdated = true;
      }
      this.setState({
        renderMessages: renderMessages,
        fetching: false
      });
    }).catch((error) => {
      this.setState({fetching: false});
    });
  };

  _renderIos = () => {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior='padding'
        keyboardVerticalOffset={64}>
        {this._renderShared()}
      </KeyboardAvoidingView>
    );
  };

  _renderAndroid = () => {
    return (
      <View style={styles.container}>
        {this._renderShared()}
      </View>
    );
  };

  _renderShared() {
    return (
      <View style={styles.innerContainer}>
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
            if(!this.messagesUpdated) {
              this.scrollView.scrollToEnd({animated: true});
            } else {
              this.messagesUpdated = false;
            }
          }}>
          <View style={styles.messageContainer}>
            {this.state.renderMessages}
          </View>
        </ScrollView>
        <View style={styles.footerContainer}>
          <View style={styles.newMessageContainer}>
            <TouchableOpacity style={styles.rowImageContainer} onPress={this.selectImage}>
              <Icon name='plus-circle' style={{fontSize: 20, color: 'black'}}/>
            </TouchableOpacity>
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
        {this.state.loading &&
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.activeTabColor}/>
        </View>
        }
      </View>
    );
  }

  render() {
    if (Platform.OS === 'ios') {
      return this._renderIos();
    } else {
      return this._renderAndroid();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: colors.backgroundColor
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
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    justifyContent: 'flex-end'
  },
  rowContainer: {
    maxWidth: '90%',
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
    minHeight: 50,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 7
  },
  newMessageContainer: {
    flex: 7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  dateText: {
    alignSelf: 'center',
    fontSize: 12
  },
  messageText: {
    padding: 5,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'left',
    color: 'black',
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
  },
  messageImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: undefined,
    height: undefined,
    borderRadius: 20,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 2,
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});