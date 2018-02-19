import React, {Component} from 'react';
import {Modal, Picker, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../shared/colors';

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
    containerStyle: PropTypes.array
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
      noSubmitButton
    } = this.props;

    return (
      <Modal
        animationType='fade'
        transparent={true}
        onRequestClose={() => {
        }}
        visible={visible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalInnerContainer]}>
            <Text>{modalTitle}</Text>
            {isPicker &&
            <Picker
              mode='dialog'
              onValueChange={onPickerValueChange}
              selectedValue={selectedPickerValue}>
              {pickerItems}
            </Picker>
            }
            {this.props.children}
            {(!noCancelButton || !noSubmitButton) &&
            <View style={styles.modalRowContainer}>
              {!noCancelButton &&
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onCancel}>
                <Text>Annullér</Text>
              </TouchableOpacity>
              }
              {!noSubmitButton &&
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onSubmit}>
                <Text>OK</Text>
              </TouchableOpacity>
              }
            </View>
            }
          </View>
        </View>
      </Modal>
    )
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
  },
  modalInnerContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 2,
    opacity: 1,
    backgroundColor: colors.modalBackgroundColor,
    borderWidth: StyleSheet.hairlineWidth
  },
  modalRowContainer: {
    flexDirection: 'row',
    margin: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  modalButton: {
    marginLeft: 40
  }
});