import {AsyncStorage} from 'react-native';
import {STORAGE_KEY} from 'react-native-dotenv';

export async function getUser() {
  try {
    let userJson = await AsyncStorage.getItem(STORAGE_KEY);
    return await JSON.parse(userJson) || null;
  } catch (error) {
    return error;
  }
}

export async function setUser(email, password) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({email: email, password: password}));
  } catch (error) {
    return error;
  }
}

export async function removeUser() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    return error;
  }
}