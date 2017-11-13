import {AsyncStorage} from 'react-native';
import {STORAGE_KEY} from 'react-native-dotenv';

export default class UserStorage {

  static async getUser() {
    try {
      let userJson = await AsyncStorage.getItem(STORAGE_KEY);
      return await JSON.parse(userJson) || null;
    } catch (error) {
      return error;
    }
  }

  static async setUser(user) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      return error;
    }
  }

  static async removeUser() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      return error;
    }
  }
}