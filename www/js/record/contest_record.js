module.controller('crecordController', function($scope, $timeout){
  var crecord = this;
  var contest = editNavigator.topPage.data;
  crecord.name = contest.name;
  crecord.date = contest.date;
  crecord.classes = contest.classes;
  crecord.address = "boiler.archive@gmail.com";
  if(login_address)crecord.address = login_address;
  
  crecord.kana = kana;
  crecord.group_index = group_index;

  crecord.setPlayer = function(player, cl){
    crecord.player = player;
    crecord.player.class = cl;
    crecordMenu.setMainPage('crecord_update.html', {closeMenu: true});
    crecord.record = {
      result: true,
      diff: 10,
      belong: group_list[0].name,
    };
  }
  
  crecord.saveData = function(){
    if(!crecord.record.name){
      if(crecord.player.round == 1){
        ons.notification.confirm(
          "不戦勝として処理します。よろしいですか？",
          {
            title: "確認",
            callback: function(index){
              if(index == 1){
                var record = new ContestRecord();
                record.set("contest", crecord.name)
                  .set("round", crecord.player.round)
                  .set("class", crecord.player.class)
                  .set("player", crecord.player.name)
                  .set("opponent", "")
                  .set("result", true)
                  .save();
                  
                crecord.player.round += 1;

                updateContestInfo(crecord.name, function(contest){
                  return contest.set("classes", JSON.stringify(crecord.classes))
                          .update();
                });
      
                ons.notification.alert("結果を記録しました。", {title: "情報送信"});
                crecordMenu.setMainPage('crecord_index.html', {closeMenu: true});
              }
            }
          });  
      }
      else ons.notification.alert("対戦者名が登録されていません。", {title: "入力の不備"});
    }
    else{
      if(!crecord.record.name.match(/^[^\w!-~]+$/)){
        ons.notification.alert("正しい名前を入力してください。", {title: "情報の不備"});
        return;
      }
      var record = new ContestRecord();
      record.set("contest", crecord.name)
        .set("round", crecord.player.round)
        .set("class", crecord.player.class)
        .set("player", crecord.player.name)
        .set("opponent", crecord.record.name)
        .set("result", crecord.record.result)
        .set("diff", crecord.record.diff)
        .set("belong", crecord.record.belong)
        .save();
      
      if(crecord.record.result)crecord.player.round += 1;
      else crecord.player.round *= -1;
      
      updateContestInfo(crecord.name, function(contest){
        return contest.set("classes", JSON.stringify(crecord.classes))
                .update();
      });
      
      ons.notification.alert("結果を記録しました。", {title: "情報送信"});
      crecordMenu.setMainPage('crecord_index.html', {closeMenu: true});
    }
  }
  
  crecord.showRemain = function(round, total){
    if(round == 1)return "残り" + total + "人";
    var whole = parseInt(Math.ceil(Math.LOG2E * Math.log(total)));
    var rem = Math.pow(2, whole - round + 1);
    if(rem > 8)return "残り" + rem + "人";
    if(rem == 8)return "準々決勝";
    if(rem == 4)return "準決勝";
    if(rem == 2)return "決勝";
    if(rem == 1)return "優勝";
  }
  
  crecord.confirmProceed = function(){
    ons.notification.confirm(
      "入力を終了し、結果を確定します",
      {
        title: "確認",
        callback: function(index){
          if(index == 1)crecord.proceed();
        }
      });
  }

  
  crecord.proceed = function(){
    crecord.outputResult();
    
    updateContestInfo(crecord.name, function(contest){
      return contest.set("completed", true)
              .update();
    });
    
    crecordMenu.setMainPage('crecord_result.html', {closeMenu: true});
  }
  
  crecord.outputResult = function(){
    var paras = [];
    paras.push(crecord.date + "に行われた" + crecord.name + "の結果です。");
    paras.push("");
    paras.push("参加者");
    for(var cl in crecord.classes){
      var para = cl + "級(" + crecord.classes[cl].total + "人): ";
      crecord.classes[cl].players.forEach(function(player){
        para += player.name + " ";
      });
      paras.push(para);
    }
    paras.push("");
    
    ContestRecord.equalTo("contest", crecord.name)
      .fetchAll()
      .then(function(results){
        var records = {};
        results.forEach(function(res){
          records[res.round + "-" + res.class + "-" + res.player] = {
            opponent: res.opponent,
            result: res.result,
            diff: res.diff,
            belong: res.belong,
          };
        });
        for(var round = 1; round <= 10; round++){
          var rrec = [];
          for(var cl in crecord.classes){
            var rec = [];
            crecord.classes[cl].players.forEach(function(player){
              var record = records[round + "-" + cl + "-" + player.name];
              if(record){
                if(record.diff){
                  rec.push(player.name + " " + (record.result ? "○" : "×") + record.diff
                            + " " + record.opponent + "（" + record.belong + "）");
                }else{
                  rec.push(player.name + " 不戦勝");
                }
              }
            });
            if(rec.length > 0){
              rrec.push(cl + "級");
              rrec = rrec.concat(rec);
            }
          }
          if(rrec.length > 0){
            paras.push(round + "回戦");
            paras = paras.concat(rrec);
            paras.push("");
          }
          else break;
        }
        $scope.$apply(function(){
          crecord.resultPara = paras;
        });
        sendMail(crecord.address, "boiler.archive@gmail.com", crecord.name + "の結果", paras);
      });
  }
});