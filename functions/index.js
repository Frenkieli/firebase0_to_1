// const functions = require('firebase-functions');
// // Call request dependency

// const request = require('request');

// //---------(Firebase Admin)----------//
// // Call firebase-admin dependency
// const admin = require("firebase-admin");
// // Initialize firebase-admin
// admin.initializeApp(functions.config().firebase)
// // Create variable for connecting to the Firestore Database

// // 這側地區和佔用記憶體
// const region = 'asia-east2';
// const spec = {
//   memory: "1GB"
// };


// const db = admin.firestore();


// exports.LineMessAPI = functions.region(region).runWith(spec).https.onRequest((request, response) => {
//   response.send("Hello from CloudFunction!");
// });
// // // Create and Deploy Your First Cloud Functions
// // // https://firebase.google.com/docs/functions/write-firebase-functions
// //
// // exports.helloWorld = functions.https.onRequest((request, response) => {
// //  response.send("Hello from Firebase!");
// // });
// // exports.LineMessAPI = functions.https.onRequest((request, response) => {
// // });


const functions = require('firebase-functions');
const request = require('request');
const region = 'asia-east2';
const spec = {
  memory: "1GB"
};

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase)
const db = admin.firestore();

exports.LineMessAPI = functions.region(region).runWith(spec).https.onRequest((request, respond) => {
  // console.log(request.body.events);
  var event = request.body.events[0];
  // console.log(event);
  var userId = event.source.userId;
  var timestamp = event.timestamp;
  var replyToken = event.replyToken;
  var userText = ""
  if (event.type === "message" && event.message.type === "text") {
    userText = event.message.text
  } else {
    userText = "(Message type is not text)";
  }
  const addChatHistory = db.collection("chat-history").doc(timestamp.toString()).set({
    "userId": userId,
    "Message": userText,
    "timestamp": timestamp
  })
  // console.log(addChatHistory, 'addChatHistory');
  // reply_message(replyToken, "我真的有回話喔!!!")
  const getUserData = db.collection("Customer").doc(userId).get().then(returnData => {
    if (returnData.exists) {
      var name = returnData.data().name
      var surname = returnData.data().surname
      var nickname = returnData.data().nickname
      reply_message(replyToken, `Hello ${nickname}(${name} ${surname})`)
    } else {
      reply_message(replyToken, "You are not the customer, Register?")
    }
    return null
  }).catch(err => {
    console.log(err)
  })
  // console.log(getUserData, 'getUserData');

  return respond.status(200).send(request.method);
});

const LINE_HEADER = {
  "Content-Type": "application/json",
  "Authorization": "Bearer XDEBoNNUfbi7W+Yq6BGgPJXjqDBsOigkUMDp65Ivr5R6CuKPWImZvEXLL/zlzottxYeWHO/dJXst2SkXPC78XVg+gzI2IyBwcGxEgxi3VKOecDHcxKnKRaEQyreGQxP4MgT1z97uakoyjZh5B5fZ7gdB04t89/1O/w1cDnyilFU="
}

// "Authorization": "Bearer {'U742e3d61460468e04962bd10e84aa706'}"
function reply_message(replytoken, textfrom) {
  return request.post({
    uri: 'https://api.line.me/v2/bot/message/reply',
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: replytoken,
      messages: [
        {
          type: "text",
          text: textfrom
        }
      ]
    })
  });
}