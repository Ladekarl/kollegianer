import React, {Component} from 'react';
import Icon from 'react-native-fa-icons';
import colors from '../shared/colors';
import AutoExpandingTextInput from './AutoExpandingTextInput';
import Database from '../storage/Database';
import ImagePicker from 'react-native-image-picker';
import Guid from '../shared/Guid';
import FitImage from 'react-native-fit-image';
import Lightbox from '../../lib/react-native-lightbox/Lightbox';
import ModalScreen from './Modal';
import LocalStorage from "../storage/LocalStorage";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default class GossipScreen extends Component {

  static navigationOptions = {
    tabBarLabel: 'Gossip',
    tabBarIcon: ({tintColor}) => (
      <Icon name='heartbeat' style={{fontSize: 20, height: undefined, width: undefined, color: tintColor}}/>),
  };

  localUser;
  selectedMessage;
  senderFilter = [];
  messageFilter = [];

  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      renderMessages: [],
      messages: [],
      message: '',
      loading: false,
      messageModalVisible: false
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
    LocalStorage.getUser().then(localUser => {
      this.localUser = localUser;
      Database.getUser(localUser.uid).then((snapshot) => {
        let user = snapshot.val();
        this.senderFilter = user.blockedUsers ? user.blockedUsers : [];
        this.messageFilter = user.blockedMessages ? user.blockedMessages : [];
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
      });
    });
  }

  componentWillUnmount() {
    Database.unListenGossip();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  setMessageModalVisible = (visible) => {
    this.setState({messageModalVisible: visible});
  };

  _keyboardDidShow = () => {
    this.scrollView.scrollToEnd({animated: true});
  };

  _keyboardDidHide = () => {
    this.scrollView.scrollToEnd({animated: true});
  };

  renderMessages = () => {
    let renderMessages = [];
    this.messages
      .forEach(message => {
        if (this.messageFilter.indexOf(message.key) === -1) {
          let senderId = message.val().id;
          if (senderId) {
            if (this.senderFilter.indexOf(senderId) === -1) {
              renderMessages.push(this._renderMessage(message))
            }
          } else {
            renderMessages.push(this._renderMessage(message))
          }
        }
      });
    return renderMessages;
  };

  showMessageOptions = (messageSnapshot) => {
    this.selectedMessage = messageSnapshot;
    this.selectedMessage.isOwnMessage =
      this.selectedMessage
      && this.localUser
      && this.localUser.uid
      && this.selectedMessage.val()
      && this.selectedMessage.val().id
      && String(this.selectedMessage.val().id).valueOf() == String(this.localUser.uid).valueOf();
    this.setMessageModalVisible(true);
  };

  _reportContent = () => {
    if (this.selectedMessage) {
      let newMessage = this.selectedMessage.val();
      newMessage.flagged = true;
      Database.updateGossip(this.selectedMessage.key, newMessage);
    }
    this.setMessageModalVisible(false);
    this.selectedMessage = undefined;
  };

  _blockSender = () => {
    Database.getUser(this.localUser.uid).then((snapshot) => {
      let user = snapshot.val();
      if (!user.blockedUsers) user.blockedUsers = [];
      user.blockedUsers.push(this.selectedMessage.val().id);
      Database.updateUser(snapshot.key, user).then(() => {
        this.messagesUpdated = true;
        this.senderFilter = user.blockedUsers;
        this.setState({renderMessages: this.renderMessages()});
      });
    });
  };

  _blockOrDeleteMessage = () => {
    if (this.selectedMessage && this.selectedMessage.isOwnMessage) {
      this._deleteMessage(this.selectedMessage);
    } else if (this.selectedMessage && !this.selectedMessage.isOwnMessage) {
      this._blockMessage(this.selectedMessage);
    }
    this.setMessageModalVisible(false);
    this.selectedMessage = undefined;
  };

  _deleteMessage = (message) => {
    this.messagesUpdated = true;
    Database.deleteGossip(message.key);
  };

  _blockMessage = (message) => {
    Database.getUser(this.localUser.uid).then((snapshot) => {
      let user = snapshot.val();
      if (!user.blockedMessages) user.blockedMessages = [];
      user.blockedMessages.push(message.key);
      Database.updateUser(snapshot.key, user).then(() => {
        this.messageFilter = user.blockedMessages;
        this.messagesUpdated = true;
        this.setState({renderMessages: this.renderMessages()});
      });
    });
  };

  _renderMessage = (renderMessage) => {
    const message = renderMessage.val();
    if (!message.photo) {
      return (
        <View
          key={renderMessage.key}
          style={message.flagged ? styles.flaggedColumnContainer : styles.columnContainer}>
          <Text style={styles.dateText}>{message.date}</Text>
          <View
            style={styles.rowContainer}>
            <Icon name='user-circle' style={styles.rowImage}/>
            <TouchableOpacity onLongPress={() => this.showMessageOptions(renderMessage)}>
              <Text style={styles.messageText}>{message.message}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View
          key={renderMessage.key}
          style={message.flagged ? styles.flaggedColumnContainer : styles.columnContainer}>
          <Text style={styles.dateText}>{message.date}</Text>
          <View
            style={styles.rowContainer}>
            <Icon name='user-circle' style={styles.rowImage}/>
            <Lightbox navigator={null}
                      activeProps={{style: this._renderLightBoxImageContainerStyle(message.photo)}}
                      style={styles.lightBoxContainer}
                      onLongPress={() => this.showMessageOptions(renderMessage)}
                      renderContent={() => (
                        <ScrollView
                          minimumZoomScale={1}
                          maximumZoomScale={5}
                          contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center'
                          }}
                          centerContent={true}>
                          <FitImage
                            style={styles.messageImage}
                            originalWidth={message.photo.width}
                            originalHeight={message.photo.height}
                            resizeMode='contain'
                            resizeMethod='resize'
                            source={{uri: message.photo.url}}/>
                        </ScrollView>)
                      }>
              <View style={this._messageImageContainerStyle(message.photo)}>
                <FitImage
                  style={styles.messageImage}
                  originalWidth={message.photo.width}
                  originalHeight={message.photo.height}
                  resizeMode='contain'
                  resizeMethod='resize'
                  source={{uri: message.photo.url}}/>
              </View>
            </Lightbox>
          </View>
        </View>
      );
    }
  };

  _messageImageContainerStyle = (photo) => {
    return {
      aspectRatio: photo.width / photo.height,
      maxHeight: (Dimensions.get('window').width / 2) - 20,
      maxWidth: Dimensions.get('window').width - 20,
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    };
  };

  _renderLightBoxImageContainerStyle = (photo) => {
    return {
      aspectRatio: photo.width / photo.height,
      maxHeight: Dimensions.get('window').height,
      maxWidth: Dimensions.get('window').width
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
        date: date,
        id: this.localUser.uid
      };
      Database.addGossip(newMessage);
      this.setState({message: ''});
      Keyboard.dismiss();
    }
  };

  submitPhotoMessage = (photo) => {
    let date = this._formatDate();
    let newMessage = {
      message: '',
      date: date,
      photo: photo,
      id: this.localUser.uid
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
      quality: 0.3,
      noData: true,
      storageOption: {
        skipBackup: true
      },
      permissionDenied: {
        reTryTitle: 'Prøv igen',
        okTitle: 'Helt sikkert',
        title: 'Tilladelse afvist',
        text: 'For at kunne tage billeder med dit kamera og vælge billeder fra dit bibliotek.'
      }
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (!response.error && !response.didCancel) {
        const photoPath = response.uri;
        const width = response.width;
        const height = response.height;
        const uploadUri = Platform.OS === 'ios' ? photoPath.replace('file://', '') : photoPath;
        this.setState({loading: true});
        Database.addGossipImage(uploadUri, Guid()).then((snapshot) => {
          this.submitPhotoMessage({
            url: snapshot.downloadURL,
            width: width,
            height: height
          });
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
      if (renderMessages.length > this.state.renderMessages.length) {
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

  _onContentSizeChanged = () => {
    if (!this.messagesUpdated) {
      this.scrollView.scrollToEnd({animated: true});
    } else {
      this.messagesUpdated = false;
    }
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
          onContentSizeChange={this._onContentSizeChanged}>
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
              autoCapitalize='sentences'
              returnKeyType='send'
              onSubmitEditing={this.submitMessage}
              onChangeText={this.onMessageChange}/>
          </View>
          <TouchableOpacity style={styles.rowImageContainer} onPress={this.submitMessage}>
            <Icon name='send' style={{fontSize: 20, color: 'black'}}/>
          </TouchableOpacity>
        </View>
        <ModalScreen
          modalTitle={'Foretag en handling'}
          visible={this.state.messageModalVisible}
          onCancel={() => {
            this.setMessageModalVisible(false);
            this.selectedMessage = undefined;
          }}
          noSubmitButton={true}>
          <View style={styles.messageModalContainer}>
            <TouchableOpacity style={styles.messageModalButton} onPress={this._blockOrDeleteMessage}>
              <Text style={styles.messageModalTextStyle}>
                {this.selectedMessage && this.selectedMessage.isOwnMessage ?
                  'Slet besked' : 'Blokér besked'}
              </Text>
            </TouchableOpacity>
            {this.selectedMessage && !this.selectedMessage.isOwnMessage &&
            <TouchableOpacity style={styles.messageModalButton} onPress={this._blockSender}>
              <Text style={styles.messageModalTextStyle}>
                Blokér afsender
              </Text>
            </TouchableOpacity>
            }
            {this.selectedMessage && !this.selectedMessage.isOwnMessage &&
            <TouchableOpacity style={styles.messageModalButton} onPress={this._reportContent}>
              <Text style={styles.messageModalTextStyle}>
                Rapportér indhold
              </Text>
            </TouchableOpacity>
            }
          </View>

        </ModalScreen>
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
    marginBottom: 5,
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
    flexDirection: 'column',
  },
  flaggedColumnContainer: {
    flexDirection: 'column',
    backgroundColor: colors.redColor
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
    paddingTop: 7,
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
    maxWidth: Platform.OS === 'ios' ? '100%' : '90%',
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
    borderRadius: 10,
  },
  lightBoxContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderRadius: 20,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 2
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  messageModalContainer: {
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  messageModalButton: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.backgroundColor,
    margin: 10
  },
  messageModalTextStyle: {
    fontSize: 15,
    marginTop: 15,
    marginBottom: 15,
    color: colors.logoutTextColor,
  }
});