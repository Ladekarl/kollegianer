package com.kollegianer;

import android.app.Application;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.react.ReactApplication;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.soloader.SoLoader;
import com.imagepicker.ImagePickerPackage;
import com.rnfs.RNFSPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.storage.RNFirebaseStoragePackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

    protected static CallbackManager getCallbackManager() {
        return mCallbackManager;
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
            new AsyncStoragePackage(),
                    new RNFetchBlobPackage(),
                    new RNGestureHandlerPackage(),
                    new RNI18nPackage(),
                    new RNFSPackage(),
                    new DocumentPickerPackage(),
                    new ImagePickerPackage(),
                    new RNFirebasePackage(),
                    new RNFirebaseMessagingPackage(),
                    new RNFirebaseAuthPackage(),
                    new RNFirebaseDatabasePackage(),
                    new RNFirebaseNotificationsPackage(),
                    new RNFirebaseStoragePackage(),
                    new FBSDKPackage(mCallbackManager)
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }


    @Override
    public void onCreate() {
        super.onCreate();
        AppEventsLogger.activateApp(this);
        SoLoader.init(this, /* native exopackage */ false);
    }
}
