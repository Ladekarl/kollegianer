import AsyncStorage from '@react-native-community/async-storage';
import {FCM_TOKEN_STORAGE_KEY, USER_STORAGE_KEY} from 'react-native-dotenv';

export default class LocalStorage {

    static async getUser() {
        try {
            let userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
            return await JSON.parse(userJson) || null;
        } catch (error) {
            return error;
        }
    }

    static async setUser(user) {
        try {
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } catch (error) {
            return error;
        }
    }

    static async removeUser() {
        try {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        } catch (error) {
            return error;
        }
    }

    static async setFcmToken(token) {
        try {
            await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, JSON.stringify(token));
        } catch (error) {
            return error;
        }
    }

    static async getFcmToken() {
        try {
            let tokenJson = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);
            return await JSON.parse(tokenJson) || null;
        } catch (error) {
            return error;
        }
    }
}