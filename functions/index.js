const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.notifyLikes = functions.database.ref('/post_likes/{postId}/{userId}').onWrite(event => {

  const snapshot = event.data;
  if (snapshot.previous.val() !== null) {
    return;
  }

  const postId = event.params.postId;
  const userId = event.params.userId;

  admin.database().ref('posts').child(postId).once('value', function(postSnapshot) {
    post = postSnapshot.val();
    const authorId = post.user_id;
    const payload = {
      notification: {
        title: "Vegetalia",
        body: "Alguém curtiu sua publicação",
        // icon: snapshot.val().photoUrl || '/images/profile_placeholder.png',
        // click_action: `https://${functions.config().firebase.authDomain}`
      }
    };

    admin.database().ref('tokens').child(authorId).once('value', function(tokenSnapshot) {
      token = tokenSnapshot.val();
      console.log("Token: ");
      console.log(token);
      admin.messaging().sendToDevice(token, payload);
    });
  });
});
