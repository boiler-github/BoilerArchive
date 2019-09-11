var module = ons.bootstrap();
firebase.initializeApp({
  apiKey: 'AIzaSyCnVNTuF4IUPiER0luEX2uknXzy7GRrFQ4',
  authDomain: 'boilerarchive-31164.firebaseapp.com',
  projectId: 'boilerarchive-31164'
});
var db = firebase.firestore();
var classes = ["A", "B3", "B", "C", "D"];
var kana = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ", "他"];

//各種リスト作成
function makePlayerList(){
  player_list = {};
  // var count = 0;

  // var p1 = Member.order("head", false)
  //           .fetchAll()
  //           .then(function(members){
  //             members.forEach(function(member){
  //               var head = getRow(member.head);
  //               if(!player_list[head])player_list[head] = [];
  //               player_list[head].push({
  //                 name: member.name,
  //                 class: member.class,
  //                 grade: member.grade,
  //                 upgradeDate: member.upgradeDate,
  //                 rating: member.rating,
  //                 isMember: true,
  //                 index: count,
  //               });
  //               count++;
  //             });
  //           });
  // return p1.then(function(){
  //         Guest.order("head", false)
  //           .fetchAll()
  //           .then(function(guests){
  //             guests.forEach(function(guest){
  //               var head = getRow(guest.head);
  //               if(!player_list[head])player_list[head] = [];
  //               player_list[head].push({
  //                 name: guest.name,
  //                 class: guest.class,
  //                 belong: guest.belong,
  //                 isMember: false,
  //                 index: count,
  //               });
  //               count++;
  //             });
  //           });
  //         });
}

function makeMemberList(){
  member_list = [];
  // return Member.order("head", false)
  //         .fetchAll()
  //         .then(function(members){
  //           members.forEach(function(member){
  //             member_list.push({
  //                 name: member.name,
  //                 head: member.head,
  //                 class: member.class,
  //                 grade: member.grade,
  //                 upgradeDate: member.upgradeDate,
  //                 rating: member.rating,
  //                 updated: member.updated,
  //             });
  //           });
  //         });
}

function makeGuestList(){
  guest_list = [];
  // return Guest.order("head", false)
  //         .fetchAll()
  //         .then(function(guests){
  //           guests.forEach(function(guest){
  //             guest_list.push({
  //               name: guest.name,
  //               head: guest.head,
  //               class: guest.class,
  //               belong: guest.belong,
  //             });
  //           });
  //         });
}

function makeSongerList(){
  songer_list = [];
  // return Songer.order("id", false)
  //         .fetchAll()
  //         .then(function(songers){
  //           songers.forEach(function(songer){
  //             songer_list.push({
  //               name: songer.name,
  //               id: songer.id,
  //               count: songer.count,
  //             });
  //           });
  //         });
}

function makeGroupList(){
  group_list = [];
  group_index = {};
  
  return db.collection('groups').get()
    .then(function(docs) {
      docs.forEach(function(doc) {
        var group = doc.data();

        group_list.push({
          id: doc.id,
          name: group.name,
          head: group.head,
        });
        var head = getRow(group.head);
        if(!group_index[head]) group_index[head] = [];
        group_index[head].push({
          id: doc.id,
          name: group.name,
          head: group.head,
        });
      });
    });
}

function makeTypeList(){
  type_list = [];
  // return GameType.order("id", false)
  //         .fetchAll()
  //         .then(function(types){
  //           types.forEach(function(type){
  //             type_list.push({
  //               name: type.name,
  //               id: type.id,
  //               isRegular: type.isRegular,
  //             });
  //           });
  //         });
}

function makeContestList(){
  contest_list = [];
  // return ContestInfo.equalTo("completed", false)
  //         .order("date", true)
  //         .limit(3)
  //         .fetchAll()
  //         .then(function(contests){
  //           contests.forEach(function(contest){
  //             contest_list.push({
  //               name: contest.name,
  //               date: contest.date,
  //               classes: JSON.parse(contest.classes),
  //             });
  //           });
  //         });
}

var songer_list = [];
makeSongerList();

var player_list = {};
makePlayerList();

var type_list = [];
makeTypeList();

var group_list = [];
var group_index = [];
makeGroupList();

var member_list = [];
makeMemberList();

var guest_list = [];
makeGuestList();

var contest_list = [];
makeContestList();

var sysstart, semester;
var admin_pass;

// Config.fetchAll()
//   .then(function(results){
//     results.forEach(function(result){
//       if(result.name == "sysstart"){
//         sysstart = result.value;
//       }
//       if(result.name == "semester"){
//         semester = result.value;
//       }
//       if(result.name == "admin_pass"){
//         admin_pass = result.value;
//       }
//     });
//   });

var NODATA = "---";
var SINGLE = "一人取り";

var login_player = localStorage.getItem('player');
var login_address = localStorage.getItem('address');
if(!login_address) login_address = "boiler.archive@gmail.com";
var login_admin = localStorage.getItem('admin');

var pre_date = localStorage.getItem('pre_date');
var pre_round = parseInt(localStorage.getItem('pre_round'));
var pre_players = JSON.parse(localStorage.getItem('pre_players'));
if(!pre_players)pre_players = [];
