const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.notifyLikes = functions.database.ref('/post_likes/{postId}/{userId}').onWrite(event => {

  const snapshot = event.data;

  //Never notify if it's not the first time this user likes this post...
  if (snapshot.previous.exists()) {
    return;
  }

  const postId = event.params.postId;
  const userId = event.params.userId;

  admin.database().ref('posts').child(postId).once('value', function(postSnapshot) {
    post = postSnapshot.val();
    const authorId = post.user_id;
    const payload = {
      data: {
        type: "notification_like",
        post: postId,
        who: userId,
      }
    };

    admin.database().ref('tokens').child(authorId).once('value', function(tokenSnapshot) {
      admin.messaging().sendToDevice(tokenSnapshot.val(), payload);
      console.log("Notification succesfully sent.")
    });
  });
});
