import LocalStorage from '../storage/LocalStorage';
import firebase from 'react-native-firebase';
import Database from '../storage/Database';

export const onSignInSuccess = (response, password, accessToken) => {
    const user = response.user;
    return Database.getUser(user.uid).then(snapshot => {
        const dbUser = snapshot.val();
        if (!dbUser) {
            return Database.addUser(user).then(() => {
                return Database.getUser(user.uid);
            });
        }
        return snapshot;
    }).then((response) => {
        const dbUser = response.val();
        LocalStorage.getFcmToken().then(fcmToken => {
            if (fcmToken && fcmToken.token) {
                let notificationTokens = dbUser.notificationTokens ?? [];
                let tokenFound = false;
                notificationTokens.forEach(t => {
                    if (t.token && String(t.token).valueOf() == String(fcmToken.token).valueOf()) {
                        tokenFound = true;
                    }
                });
                if (!tokenFound) {
                    notificationTokens.push(fcmToken);
                }
                Database.updateUser(user.uid, {
                    notificationTokens
                }).catch(error => console.log(error));
            }
        });
        dbUser.uid = user.uid;
        dbUser.password = password;
        dbUser.accessToken = accessToken;

        return LocalStorage.setUser(dbUser);
    }).catch(error => {
        console.log(error);
    });
};

export const signInEmail = (user) => {
    return firebase.auth().signInWithEmailAndPassword(user.email, user.password).then(response => {
        return onSignInSuccess(response, user.password, user.accessToken);
    });
};

export const signInFacebook = (user) => {
    const credential = firebase.auth.FacebookAuthProvider.credential(user.accessToken);
    return firebase.auth().signInWithCredential(credential).then(response => {
        return onSignInSuccess(response, user.password, user.accessToken);
    });
};

export const signIn = () => {
    return LocalStorage.getUser().then(user => {
        if (user && user.email && user.uid) {
            if (user.accessToken) {
                return signInFacebook(user);
            } else if (user.password) {
                return signInEmail(user);
            } else {
                return Promise.reject('No accessToken or password');
            }
        } else {
            return Promise.reject('Incomplete user information');
        }
    });
};