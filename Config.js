import firebase from "firebase";

  var firebaseConfig = {
    apiKey: "AIzaSyAuARwWQxqxr9VxMio5LH8ruCUNpUtZhcI",
    authDomain: "wireless-library-c6c2d.firebaseapp.com",
    projectId: "wireless-library-c6c2d",
    storageBucket: "wireless-library-c6c2d.appspot.com",
    messagingSenderId: "894353008410",
    appId: "1:894353008410:web:d823b33338db2d0442aea3"
  };

  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();