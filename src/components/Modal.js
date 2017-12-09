import React, {
  Component
} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  Picker,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../shared/colors';

export default class ModalScreen extends Component {

  static propTypes = {
    onValueChange: PropTypes.func.isRequired,
    selectedValue: PropTypes.string.isRequired,
    pickerItems: PropTypes.array.isRequired,
    modalTitle: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      onValueChange,
      selectedValue,
      pickerItems,
      modalTitle,
      visible,
      onSubmit,
      onCancel
    } = this.props;

    return (
      <Modal
        animationType='fade'
        transparent={true}
        onRequestClose={() => {
        }}
        visible={visible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalPickerContainer}>
            <Text>{modalTitle}</Text>
            <Picker
              mode='dialog'
              onValueChange={onValueChange}
              selectedValue={selectedValue}>
              {pickerItems}
            </Picker>
            <View style={styles.modalPickerRowContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onCancel}>
                <Text>Annullér</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onSubmit}>
                <Text>OK</Text>
              </TouchableOpacity>
            </View>
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
  modalPickerContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 2,
    opacity: 1,
    backgroundColor: colors.modalBackgroundColor,
    borderWidth: StyleSheet.hairlineWidth
  },
  modalPickerRowContainer: {
    flexDirection: 'row',
    margin: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  modalButton: {
    marginLeft: 40
  }
});