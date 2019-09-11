//レーティング計算
function calcRating(r_win, r_lose){
    if(r_win - r_lose > 800)return 0;
    return parseInt((800 + (r_lose - r_win)) / 25);
}

//正規試合の定義
function isRegularType(type){
  var res = false;
  type_list.forEach(function(t){
    if(t.name == type){
      res = true;
    }
  });
  return res;
}

//今日の日付
function today(){
  var now = new Date();
  return now.getFullYear() 
          + "-" + ("0" + (now.getMonth() + 1)).slice(-2)
          + "-" + ("0" + now.getDate()).slice(-2);
}

//五十音行取得
function getRow(chara){
  var kana = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ", "ん"];
  for(var i = 0; i < kana.length - 1; i++){
    if(kana[i] <= chara && chara < kana[i + 1])return kana[i];
  }
  return "他";
}

//各種アップデート
function updateMember(name, update){
  return Member.equalTo("name", name)
          .fetch()
          .then(function(member){
            return update(member);
          })
          .then(function(){
            makeMemberList();
            makePlayerList();
          });
}


function updateGuest(name, update){
  return Guest.equalTo("name", name)
          .fetch()
          .then(function(guest){
            return update(guest);
          })
          .then(function(){
            makeGuestList();
            makePlayerList();
          });
}

function updateSonger(name, update){
  return Songer.equalTo("name", name)
          .fetch()
          .then(function(songer){
            return update(songer);
          })
          .then(makeSongerList);
}

function insertGroup(group) {
  var docRef;
  if(group.id) docRef = db.collection('groups').doc(group.id);
  else docRef = db.collection('groups').doc();

  return docRef.set({
    name: group.name,
    head: group.head,
  }).then(makeGroupList);
}

function deleteGroup(group) {
  return db.collection('groups').doc(group.id).delete()
    .then(makeGroupList);
}

function updateType(name, update){
  return GameType.equalTo("name", name)
          .fetch()
          .then(function(type){
            return update(type);
          })
          .then(makeTypeList);
}

function updateContestInfo(name, update){
  return ContestInfo.equalTo("name", name)
          .order("date", true)
          .fetch()
          .then(function(contest_info){
            return update(contest_info);
          })
          .then(makeContestList);
}

//データ取得
function getMember(name){
  return Member.equalTo("name", name)
          .fetch()
          .then(function(member){
            return {
              name: member.name,
              grade: member.grade,
              class: member.class,
              upgradeDate: member.upgradeDate,
              rating: member.rating,
              sumDiff: member.sumDiff,
              total: member.total,
              win: member.win,
              results: member.results,
            };
          });
}

//条件に合うクラスを配列で返す
function classArray(player_class, cond){
  var index1 = classes.indexOf(player_class);
  var index2 = index1 + 1;
  if(player_class == "B" || player_class == "B3"){
    index1 = 1;
    index2 = 3;
  }
  if(cond == "格上")return classes.slice(0, index1);
  if(cond == "同格")return classes.slice(index1, index2);
  if(cond == "格下")return classes.slice(index2, 5);
}

function compareClass(opp, self){
  if(self == "B" || self == "B3"){
    if(opp == "A")return 1;
    else if(opp == "B" || opp == "B3")return 0;
    else return -1;
  }
  else{
    if(opp < self)return 1;
    else if(opp == self)return 0;
    else return -1;
  }
}

//戦績追加
function addHistory(old, latest){
  if(old.length == 10)
    return old.slice(1, 10) + latest;
  else
    return old + latest;
}

//日数計算
function dateDiff(from, to){
  var from_date = new Date(from);
  var to_date = new Date(to);
  return parseInt((to_date - from_date) / (60 * 60 * 24 * 1000)) + 1;
}

//表示用
function showClass(p_class){
  if(p_class == "B3")return "B級";
  else return p_class + "級";
}

function showGrade(grade){
  if(grade >= "1" && grade <= "4")return grade + "回生";
  else return grade;
}

//メール送信
function sendMail(to, from, subject, content){
  ncmb.Script
    .data({
      "to": to,
      "from": from,
      "subject": subject,
      "content": content,
    })
    .exec("POST", "sendMail.js");
}

function classDiff(class1, class2){
  var index1 = classes.indexOf(class1);
  if(index1 >= 2)index1--;
  
  var index2 = classes.indexOf(class2);
  if(index2 >= 2)index2--;
  
  return index1 - index2;
}

function replaceRecords(field, search, replace){
  Record.equalTo(field, search)
    .count()
    .fetchAll()
    .then(function(results){
      var all = results.count;
      for(var s = 0; s < all; s += 100){
        Record.equalTo(field, search)
          .skip(s)
          .fetchAll()
          .then(function(res){
            res.forEach(function(record){
              record.set(field, replace)
                .update();
            });
          });
      }
    });
}

function replaceContestRecords(field, search, replace){
  ContestRecord.equalTo(field, search)
    .count()
    .fetchAll()
    .then(function(results){
      var all = results.count;
      for(var s = 0; s < all; s += 100){
        ContestRecord.equalTo(field, search)
          .skip(s)
          .fetchAll()
          .then(function(res){
            res.forEach(function(record){
              record.set(field, replace)
                .update();
            });
          });
      }
    });
}

function replaceName(search, replace){
  replaceRecords("winner", search, replace);
  replaceRecords("loser", search, replace);
  replaceContestRecords("player", search, replace);
  
  Member.fetchAll()
    .then(function(res){
      res.forEach(function(member){
        if(!member.results)return;
        var results = JSON.parse(member.results);
        if(results[search]){
          results[replace] = results[search];
          delete results[search];
          member.set("results", JSON.stringify(results))
            .update();
        }
      });
    });
}

function replaceGuests(field, search, replace){
  Guest.equalTo(field, search)
    .fetchAll()
    .then(function(res){
      res.forEach(function(guest){
        guest.set(field, replace)
          .update();
      });
    });
}
