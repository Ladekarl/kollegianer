import React, {Component} from 'react';
import {
  Modal,
  Picker,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../shared/colors';
import {strings} from '../shared/i18n';

export default class ModalScreen extends Component {
  static propTypes = {
    onPickerValueChange: PropTypes.func,
    selectedPickerValue: PropTypes.string,
    isPicker: PropTypes.bool,
    pickerItems: PropTypes.array,
    modalTitle: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    noCancelButton: PropTypes.bool,
    noSubmitButton: PropTypes.bool,
    containerStyle: PropTypes.array,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      onPickerValueChange,
      selectedPickerValue,
      isPicker,
      pickerItems,
      modalTitle,
      visible,
      onSubmit,
      onCancel,
      noCancelButton,
      noSubmitButton,
    } = this.props;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        onRequestClose={onCancel}
        visible={visible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalInnerContainer]}>
            <View style={styles.modalTopContainer}>
              <Text style={styles.modalTitleText}>{modalTitle}</Text>
            </View>
            <View style={styles.modalCenterContainer}>
              {isPicker && (
                <View style={styles.modalPickerContainer}>
                  <Picker
                    mode="dialog"
                    onValueChange={onPickerValueChange}
                    selectedValue={selectedPickerValue}>
                    {pickerItems}
                  </Picker>
                </View>
              )}
              {this.props.children}
            </View>
            {(!noCancelButton || !noSubmitButton) && (
              <View style={styles.modalBottomContainer}>
                {!noSubmitButton && (
                  <TouchableOpacity
                    style={styles.modalSubmitButton}
                    onPress={onSubmit}>
                    <Text style={styles.modalButtonText}>
                      {strings('modal.ok')}
                    </Text>
                  </TouchableOpacity>
                )}
                {!noCancelButton && (
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={onCancel}>
                    <Text style={styles.modalButtonText}>
                      {strings('modal.cancel')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalInnerContainer: {
    width: '80%',
    maxHeight: '80%',
    borderRadius: 15,
    justifyContent: 'center',
    opacity: 1,
    backgroundColor: colors.backgroundColor,
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalTopContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalCenterContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  modalBottomContainer: {
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 12,
  },
  modalPickerContainer: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  modalCancelButton: {
    backgroundColor: colors.cancelButtonColor,
    borderRadius: 5,
    alignItems: 'center',
    margin: 5,
  },
  modalSubmitButton: {
    margin: 5,
    alignItems: 'center',
    backgroundColor: colors.submitButtonColor,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    fontSize: 15,
    marginTop: 15,
    marginBottom: 15,
    color: colors.backgroundColor,
    fontWeight: 'bold',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
