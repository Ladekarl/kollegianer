import LocalStorage from '../storage/LocalStorage';
import auth from '@react-native-firebase/auth';
import Database from '../storage/Database';

export const onSignInSuccess = async (response, password, accessToken) => {
  const user = response.user;
  try {
    const snapshot = await Database.getUser(user.uid);
    const dbUser = snapshot.val();
    if (!dbUser) {
      return Database.addUser(user).then(() => {
        return Database.getUser(user.uid);
      });
    }
    LocalStorage.getFcmToken().then(fcmToken => {
      if (fcmToken && fcmToken.token) {
        let notificationTokens = dbUser.notificationTokens ?? [];
        let tokenFound = false;
        notificationTokens.forEach(t => {
          if (
            t.token &&
            String(t.token).valueOf() === String(fcmToken.token).valueOf()
          ) {
            tokenFound = true;
          }
        });
        if (!tokenFound) {
          notificationTokens.push(fcmToken);
        }
        Database.updateUser(user.uid, {
          notificationTokens,
        }).catch(error => console.log(error));
      }
    });
    dbUser.uid = user.uid;
    dbUser.password = password;
    dbUser.accessToken = accessToken;
    return LocalStorage.setUser(dbUser);
  } catch (error) {
    console.log(error);
  }
};

export const signInEmail = async user => {
  const response = await auth().signInWithEmailAndPassword(
    user.email,
    user.password,
  );
  return onSignInSuccess(response, user.password, user.accessToken);
};

export const signInFacebook = async user => {
  const provider = auth.FacebookAuthProvider;
  return signInProvider(user, provider);
};

export const signInApple = async (user, nonce) => {
  const provider = auth.AppleAuthProvider;
  return signInProvider(user, provider, nonce);
};

export const signInProvider = async (user, provider, nonce) => {
  const credential = provider.credential(user.accessToken, nonce);
  let response;
  try {
    response = await auth().signInWithCredential(credential);
  } catch (error) {
    if (
      error.code === 'auth/account-exists-with-different-credential' &&
      auth().currentUser
    ) {
      response = await auth().currentUser.linkWithCredential(credential);
    } else {
      throw error;
    }
  }
  return onSignInSuccess(response, user.password, user.accessToken);
};

const supportedSignInMethods = [
  auth.FacebookAuthProvider.PROVIDER_ID,
  auth.AppleAuthProvider.PROVIDER_ID,
];

export const signIn = async () => {
  const user = await LocalStorage.getUser();
  if (user && user.email && user.uid) {
    if (user.accessToken) {
      const providers = await auth().fetchSignInMethodsForEmail(user.email);
      const firstProvider = providers.find(p =>
        supportedSignInMethods.includes(p),
      );
      if (!firstProvider) {
        throw new Error(
          "Your account is linked to a provider that isn't supported.",
        );
      }
      if (firstProvider === auth.FacebookAuthProvider.PROVIDER_ID) {
        return signInFacebook(user);
      }
    } else if (user.password) {
      return signInEmail(user);
    } else {
      throw new Error('No accessToken or password');
    }
  } else {
    throw new Error('Incomplete user information');
  }
};
