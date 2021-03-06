import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Camera } from '@ionic-native/camera';//import in app.module.ts
import { ImagePicker } from '@ionic-native/image-picker'; //image picker
import { Geolocation } from '@ionic-native/geolocation'; // geolocation
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { FeedPage } from '../pages/feed/feed';
import { SlideshowModule } from 'ng-simple-slideshow';


import firebase from 'firebase';
import { ReceiverPage } from '../pages/receiver/receiver';
var config = {
    apiKey: "AIzaSyADjIbI3_GRS4eRHGVGFsT2hrkKvH9K06M",
    authDomain: "trialapp-1cb3d.firebaseapp.com",
    databaseURL: "https://trialapp-1cb3d.firebaseio.com",
    projectId: "trialapp-1cb3d",
    storageBucket: "trialapp-1cb3d.appspot.com",
    messagingSenderId: "591467524421"
  };
firebase.initializeApp(config);
firebase.firestore().settings({
timestampsInSnapshots: true
});

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignUpPage,
    FeedPage,
    ReceiverPage,
  ],
  imports: [
    BrowserModule,
    SlideshowModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignUpPage,
    FeedPage,
    ReceiverPage,
    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    
    Camera,
    ImagePicker,
    Geolocation,
    ScreenOrientation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
