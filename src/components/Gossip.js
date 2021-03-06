import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../shared/colors';
import AutoExpandingTextInput from './AutoExpandingTextInput';
import Database from '../storage/Database';
import ImagePicker from 'react-native-image-picker';
import Guid from '../shared/Guid';
import Lightbox from '../../lib/react-native-lightbox/Lightbox';
import ModalScreen from './Modal';
import LocalStorage from '../storage/LocalStorage';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {strings} from '../shared/i18n';

export default class GossipScreen extends Component {
  localUser;
  selectedMessage;
  senderFilter = [];
  messageFilter = [];

  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      renderMessages: [],
      messages: [],
      message: '',
      loading: false,
      messageModalVisible: false,
    };
    this.initialLimit = 20;
    this.limit = this.initialLimit;
    this.messagesUpdated = false;
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  componentDidMount() {
    LocalStorage.getUser()
      .then(localUser => {
        this.localUser = localUser;
        Database.getUser(localUser.uid)
          .then(snapshot => {
            let user = snapshot.val();
            this.senderFilter = user.blockedUsers ? user.blockedUsers : [];
            this.messageFilter = user.blockedMessages
              ? user.blockedMessages
              : [];
            Database.listenGossip(this.initialLimit, gossipSnapshot => {
              this.messages = gossipSnapshot;
              this.setState({
                renderMessages: this.renderMessages(),
                fetching: false,
              });
              this._onContentSizeChanged();
            }).catch(error => {
              this.setState({fetching: false});
              console.log(error);
            });
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  }

  componentWillUnmount() {
    Database.unListenGossip();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  setMessageModalVisible = visible => {
    this.setState({messageModalVisible: visible});
  };

  _keyboardDidShow = () => {
    if (this.scrollView) {
      this.scrollView.scrollToEnd({animated: true});
    }
  };

  _keyboardDidHide = () => {
    if (this.scrollView) {
      this.scrollView.scrollToEnd({animated: true});
    }
  };

  renderMessages = () => {
    let renderMessages = [];
    this.messages.forEach(message => {
      let blocked = this.messageFilter.indexOf(message.key) !== -1;
      let senderId = message.val().id;
      if (senderId) {
        if (this.senderFilter.indexOf(senderId) !== -1) {
          blocked = true;
        }
        renderMessages.push(this._renderMessage(message, blocked));
      } else {
        renderMessages.push(this._renderMessage(message, blocked));
      }
    });
    return renderMessages;
  };

  showMessageOptions = messageSnapshot => {
    this.selectedMessage = messageSnapshot;
    this.selectedMessage.isOwnMessage =
      this.selectedMessage &&
      this.localUser &&
      this.localUser.uid &&
      this.selectedMessage.val() &&
      this.selectedMessage.val().id &&
      String(this.selectedMessage.val().id).valueOf() ===
        String(this.localUser.uid).valueOf();
    this.setMessageModalVisible(true);
  };

  _reportContent = () => {
    if (this.selectedMessage && !this.selectedMessage.val().flagged) {
      let newMessage = this.selectedMessage.val();
      newMessage.flagged = true;
      newMessage.flaggedBy = this.localUser.uid;
      Database.updateGossip(this.selectedMessage.key, newMessage)
        .then(() => {
          this.messagesUpdated = true;
        })
        .catch(error => console.log(error));
    }
    this.setMessageModalVisible(false);
    this.selectedMessage = undefined;
  };

  _cancelReport = () => {
    if (
      this.selectedMessage &&
      this.selectedMessage.val().flagged &&
      String(this.selectedMessage.val().flaggedBy).valueOf() ===
        String(this.localUser.uid).valueOf()
    ) {
      let newMessage = this.selectedMessage.val();
      newMessage.flagged = false;
      newMessage.flaggedBy = '';
      Database.updateGossip(this.selectedMessage.key, newMessage)
        .then(() => {
          this.messagesUpdated = true;
        })
        .catch(error => console.log(error));
    }
    this.setMessageModalVisible(false);
    this.selectedMessage = undefined;
  };

  _blockOrUnblockSender = () => {
    if (this.senderFilter.indexOf(this.selectedMessage.val().id) === -1) {
      this._blockSender();
    } else {
      this._unblockSender();
    }
    this.setMessageModalVisible(false);
    this.selectedMessage = undefined;
  };

  _blockSender = () => {
    const senderId = this.selectedMessage.val().id;
    Database.getUser(this.localUser.uid)
      .then(snapshot => {
        let user = snapshot.val();
        if (!user.blockedUsers) {
          user.blockedUsers = [];
        }
        user.blockedUsers.push(senderId);
        Database.updateUser(snapshot.key, user)
          .then(() => {
            this.messagesUpdated = true;
            this.senderFilter = user.blockedUsers;
            this.setState({renderMessages: this.renderMessages()});
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  };

  _unblockSender = () => {
    const senderId = this.selectedMessage.val().id;
    Database.getUser(this.localUser.uid)
      .then(snapshot => {
        let user = snapshot.val();
        console.log(senderId);
        user.blockedUsers = user.blockedUsers.filter(
          u => String(u).valueOf() !== String(senderId).valueOf(),
        );

        Database.updateUser(snapshot.key, user)
          .then(() => {
            this.messagesUpdated = true;
            this.senderFilter = user.blockedUsers;
            this.setState({renderMessages: this.renderMessages()});
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  };

  _blockOrUnblockMessage = () => {
    if (this.messageFilter.indexOf(this.selectedMessage.key) === -1) {
      this._blockMessage();
    } else {
      this._unblockMessage();
    }
    this.setMessageModalVisible(false);
    this.selectedMessage = undefined;
  };

  _deleteMessage = () => {
    if (this.selectedMessage && this.selectedMessage.isOwnMessage) {
      this.messagesUpdated = true;
      Database.deleteGossip(this.selectedMessage.key).catch(error =>
        console.log(error),
      );
    }
    this.setMessageModalVisible(false);
    this.selectedMessage = undefined;
  };

  _blockMessage = () => {
    const messageId = this.selectedMessage.key;
    Database.getUser(this.localUser.uid)
      .then(snapshot => {
        let user = snapshot.val();
        if (!user.blockedMessages) {
          user.blockedMessages = [];
        }
        user.blockedMessages.push(messageId);
        Database.updateUser(snapshot.key, user)
          .then(() => {
            this.messageFilter = user.blockedMessages;
            this.messagesUpdated = true;
            this.setState({renderMessages: this.renderMessages()});
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  };

  _unblockMessage = () => {
    const messageId = this.selectedMessage.key;
    Database.getUser(this.localUser.uid)
      .then(snapshot => {
        let user = snapshot.val();
        user.blockedMessages = user.blockedMessages.filter(
          m => String(m).valueOf() !== String(messageId).valueOf(),
        );
        Database.updateUser(snapshot.key, user)
          .then(() => {
            this.messageFilter = user.blockedMessages;
            this.messagesUpdated = true;
            this.setState({renderMessages: this.renderMessages()});
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  };

  _renderMessage = (renderMessage, blocked) => {
    const message = renderMessage.val();
    if (blocked) {
      message.photo = undefined;
      message.message = strings('gossip.blocked');
    }
    if (!message.photo) {
      return (
        <View
          key={renderMessage.key}
          style={
            message.flagged
              ? styles.flaggedColumnContainer
              : styles.columnContainer
          }>
          <Text style={styles.dateText}>{message.date}</Text>
          <View style={styles.rowContainer}>
            <Icon name="user-circle" style={styles.rowImage} />
            <TouchableOpacity
              onLongPress={() => this.showMessageOptions(renderMessage)}
              style={styles.messageButton}>
              <Text style={styles.messageText}>{message.message}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View
          key={renderMessage.key}
          style={
            message.flagged
              ? styles.flaggedColumnContainer
              : styles.columnContainer
          }>
          <Text style={styles.dateText}>{message.date}</Text>
          <View style={styles.rowContainer}>
            <Icon name="user-circle" style={styles.rowImage} />
            <View style={styles.imageContainer}>
              <Lightbox
                navigator={null}
                activeProps={{
                  style: this._renderLightBoxImageContainerStyle(message.photo),
                }}
                style={styles.lightBoxContainer}
                onLongPress={() => this.showMessageOptions(renderMessage)}
                buttonStyle={styles.lightBoxButton}
                originOffset={{x: 0, y: 25}}
                renderContent={() => (
                  <ScrollView
                    minimumZoomScale={1}
                    maximumZoomScale={5}
                    contentContainerStyle={styles.lightBoxScrollView}
                    centerContent={true}>
                    <Image
                      style={styles.messageImage}
                      originalWidth={message.photo.width}
                      originalHeight={message.photo.height}
                      resizeMode="contain"
                      resizeMethod="resize"
                      source={{uri: message.photo.url}}
                    />
                  </ScrollView>
                )}>
                <View style={this._messageImageContainerStyle(message.photo)}>
                  <Image
                    style={styles.messageImage}
                    originalWidth={message.photo.width}
                    originalHeight={message.photo.height}
                    resizeMode="cover"
                    resizeMethod="resize"
                    source={{uri: message.photo.url}}
                  />
                </View>
              </Lightbox>
            </View>
          </View>
        </View>
      );
    }
  };

  _messageImageContainerStyle = photo => {
    return {
      aspectRatio: photo.width / photo.height,
      maxHeight: Dimensions.get('window').width / 2 - 20,
      maxWidth: Dimensions.get('window').width - 20,
    };
  };

  _renderLightBoxImageContainerStyle = photo => {
    return {
      aspectRatio: photo.width / photo.height,
      maxHeight: Dimensions.get('window').height,
      maxWidth: Dimensions.get('window').width,
    };
  };

  onMessageChange = message => {
    this.setState({message});
  };

  submitMessage = () => {
    if (this.state.message) {
      let date = this._formatDate();
      let newMessage = {
        message: this.state.message,
        date: date,
        id: this.localUser.uid,
      };
      Database.addGossip(newMessage).catch(error => console.log(error));
      this.setState({message: ''});
      Keyboard.dismiss();
      this.forceUpdate();
    }
  };

  submitPhotoMessage = photo => {
    let date = this._formatDate();
    let newMessage = {
      message: '',
      date: date,
      photo: photo,
      id: this.localUser.uid,
    };
    Keyboard.dismiss();
    Database.addGossip(newMessage).finally(() => {
      this.setState({loading: false});
    });
  };

  selectImage = () => {
    Keyboard.dismiss();
    const options = {
      title: strings('gossip.choose_photo'),
      mediaType: 'photo',
      quality: 0.3,
      noData: true,
      storageOption: {
        skipBackup: true,
      },
      permissionDenied: {
        reTryTitle: strings('gossip.permission_try_again'),
        okTitle: strings('gossip.permission_ok'),
        title: strings('gossip.permission_title'),
        text: strings('gossip.permission_text'),
      },
    };
    ImagePicker.showImagePicker(options, response => {
      if (!response.error && !response.didCancel) {
        let path = '';
        if (Platform.OS === 'ios') {
          path = response.uri;
        } else {
          path = response.path;
        }

        const width = response.width;
        const height = response.height;

        this.setState({loading: true});
        Database.addGossipImage(path, Guid())
          .then(downloadUrl => {
            this.submitPhotoMessage({
              url: downloadUrl,
              width: width,
              height: height,
            });
          })
          .catch(error => {
            console.log(error);
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

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }
    if (hour.length < 2) {
      hour = '0' + hour;
    }
    if (minute.length < 2) {
      minute = '0' + minute;
    }

    return `${day}/${month} ${hour}:${minute}`;
  };

  updateMessages = () => {
    this.setState({fetching: true});
    this.limit = this.limit * 2;
    Database.getGossip(this.limit)
      .then(snapshot => {
        this.messages = snapshot;
        let renderMessages = this.renderMessages();
        if (renderMessages.length > this.state.renderMessages.length) {
          this.messagesUpdated = true;
        }
        this.setState({
          renderMessages: renderMessages,
          fetching: false,
        });
      })
      .catch(error => {
        this.setState({fetching: false});
      });
  };

  _renderIos = () => {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={84}>
        {this._renderShared()}
      </KeyboardAvoidingView>
    );
  };

  _renderAndroid = () => {
    return <View style={styles.container}>{this._renderShared()}</View>;
  };

  _onContentSizeChanged = () => {
    if (!this.messagesUpdated && this.scrollView) {
      this.scrollView.scrollToEnd({animated: true});
    } else {
      this.messagesUpdated = false;
    }
  };

  _renderShared() {
    const innerContainer = [
      styles.innerContainer,
      {backgroundColor: colors.backgroundColor},
    ];
    const messageModalButton = [
      styles.messageModalButton,
      {backgroundColor: colors.backgroundColor},
    ];
    return (
      <View style={innerContainer}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.fetching}
              onRefresh={this.updateMessages}
            />
          }
          contentContainerStyle={styles.scrollContainer}
          ref={ref => (this.scrollView = ref)}
          keyboardDismissMode="interactive"
          onContentSizeChange={this._onContentSizeChanged}>
          <View style={styles.messageContainer}>
            {this.state.renderMessages}
          </View>
        </ScrollView>
        <View style={styles.footerContainer}>
          <View style={styles.newMessageContainer}>
            <TouchableOpacity
              style={styles.rowImageContainer}
              onPress={this.selectImage}>
              <Icon name="plus-circle" style={styles.imageIcon} />
            </TouchableOpacity>
            <AutoExpandingTextInput
              enablesReturnKeyAutomatically={true}
              style={styles.newMessageInput}
              placeholder="Aa"
              value={this.state.message}
              underlineColorAndroid="transparent"
              selectionColor={colors.inactiveTabColor}
              textAlignVertical="bottom"
              autoCapitalize="sentences"
              returnKeyType="send"
              blurOnSubmit={true}
              autoFocus={false}
              onSubmitEditing={this.submitMessage}
              onChangeText={this.onMessageChange}
            />
          </View>
          <TouchableOpacity
            style={styles.rowImageContainer}
            onPress={this.submitMessage}>
            <Icon name="send" style={styles.imageIcon} />
          </TouchableOpacity>
        </View>
        <ModalScreen
          modalTitle={strings('gossip.message_settings')}
          visible={this.state.messageModalVisible}
          onCancel={() => {
            this.setMessageModalVisible(false);
            this.selectedMessage = undefined;
          }}
          noSubmitButton={true}>
          <View style={styles.messageModalContainer}>
            {this.selectedMessage && this.selectedMessage.isOwnMessage && (
              <TouchableOpacity
                style={messageModalButton}
                onPress={this._deleteMessage}>
                <Text style={styles.messageModalTextStyle}>
                  {strings('gossip.delete_message')}
                </Text>
              </TouchableOpacity>
            )}
            {this.selectedMessage && !this.selectedMessage.isOwnMessage && (
              <TouchableOpacity
                style={messageModalButton}
                onPress={this._blockOrUnblockMessage}>
                <Text style={styles.messageModalTextStyle}>
                  {this.messageFilter.indexOf(this.selectedMessage.key) === -1
                    ? strings('gossip.block_message')
                    : strings('gossip.undo_block_message')}
                </Text>
              </TouchableOpacity>
            )}
            {this.selectedMessage && !this.selectedMessage.isOwnMessage && (
              <TouchableOpacity
                style={messageModalButton}
                onPress={this._blockOrUnblockSender}>
                <Text style={styles.messageModalTextStyle}>
                  {this.senderFilter.indexOf(this.selectedMessage.val().id) ===
                  -1
                    ? strings('gossip.block_sender')
                    : strings('gossip.undo_block_sender')}
                </Text>
              </TouchableOpacity>
            )}
            {this.selectedMessage &&
              !this.selectedMessage.isOwnMessage &&
              this.selectedMessage.val() &&
              !this.selectedMessage.val().flagged && (
                <TouchableOpacity
                  style={messageModalButton}
                  onPress={this._reportContent}>
                  <Text style={styles.messageModalTextStyle}>
                    {strings('gossip.report')}
                  </Text>
                </TouchableOpacity>
              )}
            {this.selectedMessage &&
              !this.selectedMessage.isOwnMessage &&
              this.selectedMessage.val() &&
              this.selectedMessage.val().flagged &&
              this.selectedMessage.val().flaggedBy &&
              this.localUser &&
              String(this.selectedMessage.val().flaggedBy).valueOf() ===
                String(this.localUser.uid).valueOf() && (
                <TouchableOpacity
                  style={messageModalButton}
                  onPress={this._cancelReport}>
                  <Text style={styles.messageModalTextStyle}>
                    {strings('gossip.undo_report')}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </ModalScreen>
        {this.state.loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.inactiveTabColor} />
          </View>
        )}
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
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  scrollContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  imageContainer: {
    borderRadius: 10,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  messageContainer: {
    width: '100%',
    justifyContent: 'space-between',
  },
  rowImageContainer: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    marginBottom: 5,
    justifyContent: 'flex-end',
  },
  imageIcon: {
    fontSize: 20,
    color: 'black',
  },
  rowContainer: {
    maxWidth: '90%',
    flexDirection: 'row',
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    padding: 5,
    borderRadius: 5,
  },
  columnContainer: {
    flexDirection: 'column',
  },
  flaggedColumnContainer: {
    flexDirection: 'column',
    backgroundColor: colors.redColor,
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
    paddingBottom: 7,
  },
  newMessageContainer: {
    flex: 7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  dateText: {
    alignSelf: 'center',
    fontSize: 12,
  },
  messageButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 5,
    marginBottom: 2,
    marginLeft: 5,
    borderWidth: StyleSheet.hairlineWidth,
  },
  messageText: {
    borderRadius: 10,
    padding: 5,
    maxWidth: '100%',
    fontSize: 16,
    textAlign: 'left',
    color: colors.messageTextColor,
    backgroundColor: colors.whiteColor,
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
    paddingRight: 15,
  },
  rowImage: {
    fontSize: 25,
    color: 'black',
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 3,
    alignSelf: 'flex-end',
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
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 2,
  },
  lightBoxButton: {
    borderRadius: 10,
  },
  lightBoxScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageModalContainer: {
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  messageModalButton: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    margin: 10,
  },
  messageModalTextStyle: {
    fontSize: 15,
    marginTop: 15,
    marginBottom: 15,
    color: colors.logoutTextColor,
  },
});
