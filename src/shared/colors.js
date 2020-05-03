import ThemeManager from 'react-native-color-theme';
import LocalStorage from '../storage/LocalStorage';

export const bodegaTheme = {
  backgroundColor: '#FFFFFF',
  redColor: '#fd5f50',
  blueColor: '#d8eafd',
  goldColor: '#d4c257',
  silverColor: '#C0C0C0',
  bronzeColor: '#8C7853',
  activeTabColor: '#111111',
  bottomAccountingBoxColor: '#dcd387',
  activeDrawerColor: '#c6a333',
  inactiveTabColor: '#414141',
  lightGreyColor: '#b5b5b5',
  messageTextBackgroundColor: '#f3f0f0',
  messageTextColor: '#000',
  greenColor: '#96fd85',
  modalBackgroundColor: '#FAFAD2',
  logoutIconColor: '#dd1d00',
  darkGreenColor: '#4caf50',
  logoutTextColor: '#dd513d',
  cancelButtonColor: '#ac3429',
  submitButtonColor: '#41637a',
  facebookColor: '#3B5998',
  lightRedColor: 'rgba(10,0,0,0.2)',
  errorColor: 'red',
  whiteColor: 'white',
  blackColor: 'black',
};

let colors = new ThemeManager({bodegaTheme});

export const loadThemeManager = () => {
  return LocalStorage.getColor().then(color => {
    if (!colors) {
      colors = new ThemeManager({
        bodegaTheme,
      });
    }
    if (color) {
      colors.backgroundColor = color;
    }
    return colors;
  });
};

export const getThemeManager = () => {
  return colors;
};

export default colors;
