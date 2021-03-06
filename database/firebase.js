import * as firebase from "firebase";
import { REACT_APP_FIREBASE_API_KEY } from 'react-native-dotenv';

const config = {
    apiKey: REACT_APP_FIREBASE_API_KEY, // When on standalone app, use API key that's for Android. Else, use the no restriction key.
    authDomain: "dowhat-278213.firebaseapp.com",
    databaseURL: "https://dowhat-278213.firebaseio.com",
    projectId: "dowhat-278213",
    storageBucket: "dowhat-278213.appspot.com",
    messagingSenderId: "119205196255",
    appId: "1:119205196255:web:7acc022aba4e5b9c83546a",
    measurementId: "G-5GS3THDPQK",
};

export default !firebase.apps.length
    ? firebase.initializeApp(config)
    : firebase.app();