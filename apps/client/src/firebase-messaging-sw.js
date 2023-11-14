importScripts(
  'https://www.gstatic.com/firebasejs/9.18.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.18.0/firebase-messaging-compat.js'
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyAVr1RmPpgSUGuAMS7y1t7aK16lG78zVIM",
  authDomain: "tradebot-ce742.firebaseapp.com",
  projectId: "tradebot-ce742",
  storageBucket: "tradebot-ce742.appspot.com",
  messagingSenderId: "991998010613",
  appId: "1:991998010613:web:524da2fb9381104aa5d1bc"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});