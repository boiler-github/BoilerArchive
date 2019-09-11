module.controller('senvController', function($scope, $timeout){
  var senv = this;
  senv.date = "";
  $timeout(function(){
    senv.date = pre_date;
  }, 100);
  senv.round = pre_round + 1;
  senv.songer = songer_list[0].name;
  senv.songer_list = songer_list;
  
  //+-ボタン
  senv.addRound = function(num){
    senv.round = Math.max(parseInt(senv.round) + num, 1);
  }
  
  senv.proceed = function(){
    pre_date = senv.date;
    pre_round = senv.round;
    
    localStorage.setItem('pre_date', pre_date);
    localStorage.setItem('pre_round', pre_round);
    
    editNavigator.pushPage('player_self.html',
      {data: {date: senv.date, round: senv.round, songer: senv.songer}});
  }
});

module.controller('splayerController', function(){
  var splayer = this;
  splayer.kana = kana;
  splayer.show = "";
  splayer.player_list = player_list;
  splayer.group_index = group_index;
  splayer.player = login_player;
  //前画面からの引き継ぎデータ
  splayer.env = editNavigator.topPage.data;

  //ゲスト追加用
  splayer.classes = classes;
  splayer.guest = 
  {
    name: "",
    head: "",
    class: classes[0],
    belong: group_list[0].name,
    isMember: false,
  };
  splayer.registered = [];
  
  //次の画面への遷移
  splayer.proceed = function(){
    if(splayer.opponent_name == SINGLE){
      editNavigator.pushPage('single_self.html',
        {data: {env: splayer.env}});
    }
    else{
      editNavigator.pushPage('result_self.html',
        {data: {env: splayer.env, opponent: splayer.opponent}});
    }
  }
  
  splayer.validate = function(guest){
    var errors = [];
    if(!guest.name)
      errors.push("名前を入力してください。");
    else if(!guest.name.match(/^[^\s\w!-~]+ [^\s\w!-~]+$/))
      errors.push("名前が正しくありません。(姓と名の間は半角スペース)");
    if(!guest.head)
      errors.push("頭文字を入力してください。");
    else if(!guest.head.match(/^[ぁ-ん]$/))
      errors.push("頭文字が正しくありません。");
    if(!guest.class)
      errors.push("級を選択してください。");
    if(!guest.belong)
      errors.push("所属を選択してください。");
    
    return errors;
  }
  
  //ゲスト登録
  splayer.registerGuest = function(){
    var guest = splayer.guest;
    
    var errors = splayer.validate(guest);
    if(errors.length > 0){
      ons.notification.alert(errors.join("<br/>"), {title: "入力エラー"});
    }
    else{
      var guest_obj = new Guest();
      guest_obj.set("name", guest.name)
                .set("head", guest.head)
                .set("class", guest.class)
                .set("belong", guest.belong)
                .save()
                .then(function(){
                  makeGuestList();
                  makePlayerList();
                });
      ons.notification.alert("ゲストを登録しました。", {title: "ゲスト登録完了"});
      splayer.registered.push(guest);
      splayer.guest = 
      {
        name: "",
        head: "",
        class: splayer.classes[0],
        belong: group_list[0].name,
        isMember: false,
      };
    }
  }
});

module.controller('ssingleController', function(){
  var ssingle = this;
  var data = editNavigator.topPage.data;
  ssingle.env = data.env;

  ssingle.player = login_player;
  
  ssingle.sendData = function(){
    var date = ssingle.env.date;
    var round = ssingle.env.round;
    var songer = ssingle.env.songer;

    var record = new Record();
    record.set("date", date)
      .set("round", parseInt(round))
      .set("songer", songer)
      .set("winner", ssingle.player)
      .set("type", SINGLE)
      .set("comment", ssingle.comment)
      .set("order", true)
      .save();         
    
    editNavigator.pushPage('submit_single.html');
  }
});

module.controller('sresultController', function($scope, $timeout){
  var sresult = this;
  var data = editNavigator.topPage.data;
  
  Member.equalTo("name", login_player)
    .fetch()
    .then(function(res){
      $scope.$apply(function(){
        sresult.player = {
          name: res.name,
          class: res.class,
          isMember: true,
          rating: res.rating,
          results: res.results,
        };
        
        sresult.opponent = data.opponent;
  
        var diff = classDiff(sresult.player.class, sresult.opponent.class);
        sresult.diff = (Math.abs(diff) + 1) * 5;
        sresult.result = (diff > 0);
        sresult.type = "0";
      });
    });

  sresult.type_list = type_list;
  sresult.env = data.env;
  
  //+-ボタン
  sresult.addDiff = function(num){
    sresult.diff += num;
  }
      
  //情報送信
  sresult.sendData = function(){
    var date = sresult.env.date;
    var round = sresult.env.round;
    var songer = sresult.env.songer;

    var winner = sresult.player;
    var loser = sresult.opponent;
    
    if(sresult.result){
      winner = sresult.opponent;
      loser = sresult.player;
    }

    var feedback = {
      rating: sresult.player.rating,
      total: sresult.player.total,
      win: sresult.player.win,
      result: !sresult.result,
      opponent: sresult.opponent.name,
    };
    
    if(!sresult.player.results){
      feedback['e_total'] = 0;
      feedback['e_win'] = 0;
      feedback['e_history'] = "";
    }
    else{
      var e_result = JSON.parse(sresult.player.results)[sresult.opponent.name];
      if(e_result){
        feedback['e_total'] = e_result[0];
        feedback['e_win'] = e_result[1];
        feedback['e_history'] = e_result[2];
      }
      else{
        feedback['e_total'] = 0;
        feedback['e_win'] = 0;
        feedback['e_history'] = "";
      }
    }

    var promise = 
    Record.equalTo("loser", sresult.player.name)
      .order("date", true)
      .order("round", true)
      .fetch()
      .then(function(record){
        var last_def = (record ? record.date : sysstart);
        var last_round = (record ? record.round : 0);
        return Record.or([Record.greaterThan("date", last_def),
                            Record.equalTo("date", last_def).greaterThan("round", last_round)])
                .equalTo("winner", sresult.player.name)
                .count()
                 .fetchAll()
                 .then(function(results){
                   feedback['combo'] = results.count;
                 });
      })
      .then(function(){
        var record = new Record();
        record.set("date", date)
          .set("round", parseInt(round))
          .set("songer", songer)
          .set("winner", winner.name)
          .set("loser", loser.name)
          .set("compareClass", compareClass(winner.class, loser.class))
          .set("diff", parseInt(sresult.diff))
          .set("type", type_list[sresult.type].name)
          .set("comment", sresult.comment)
          .set("order", true)
          .save();         
      });

    if(winner.isMember && loser.isMember && type_list[sresult.type].isRegular){
      var r_change = calcRating(winner.rating, loser.rating);
      
      feedback['r_change'] = r_change;

      updateMember(winner.name, function(member_obj){
        var p_results = JSON.parse(member_obj.results);
        if(!p_results)p_results = {};
        if(p_results[loser.name]){
          var res = p_results[loser.name];
          p_results[loser.name] = [res[0] + 1, res[1] + 1, addHistory(res[2], "○")];
        }
        else p_results[loser.name] = [1, 1, "○"];
        return member_obj.setIncrement("rating", r_change)
                .setIncrement("sumDiff", sresult.diff)
                .setIncrement("total", 1)
                .setIncrement("win", 1)
                .set("results", JSON.stringify(p_results))
                .update();
      });
        
      updateMember(loser.name, function(member_obj){
        var p_results = JSON.parse(member_obj.results);
        if(!p_results)p_results = {};
        if(p_results[winner.name]){
          var res = p_results[winner.name];
          p_results[winner.name] = [res[0] + 1, res[1], addHistory(res[2], "×")];
        }
        else p_results[winner.name] = [1, 0, "×"];
        return member_obj.setIncrement("rating", -r_change)
                .setIncrement("sumDiff", -sresult.diff)
                .setIncrement("total", 1)
                .set("results", JSON.stringify(p_results))
                .update();
      });
    }
    else{
      if(winner.isMember){
        updateMember(winner.name, function(member_obj){
          return member_obj.setIncrement("sumDiff", sresult.diff)
                  .setIncrement("total", 1)
                  .setIncrement("win", 1)
                  .update();
        });
      }
      if(loser.isMember){
        updateMember(loser.name, function(member_obj){
          return member_obj.setIncrement("sumDiff", -sresult.diff)
                  .setIncrement("total", 1)
                  .update();
        });
      }
    }

    updateSonger(songer, function(songer_obj){
      songer_obj.setIncrement("count", 1)
        .update();
    });

    promise.then(function(){
      editNavigator.pushPage('submit_self.html', {data: feedback});
    })
  }
});

module.controller('ssubmitController', function($scope, $timeout){
  var ssubmit = this;

  ssubmit.analyzeHistory = function(history){
    ssubmit.e_history = history;
    var len = history.length;
    var combo = -1;
    var count = 0;
    for(var i = len - 1; i >= 0; i--){
      if(history[i] == "○"){
        count++;
      }
      else{
        if(combo == -1){
          combo = (len - i - 1);
        }
      }
    }
    if(combo == -1)combo = len;
    ssubmit.e_combo = combo;
    ssubmit.recent = count + "勝" + (len - count) + "敗";
  }

  var feedback = editNavigator.topPage.data;

  ssubmit.result = (feedback.result ? 1 : 0);
  ssubmit.opponent = feedback.opponent;
  ssubmit.old_rating = feedback.rating;
  ssubmit.r_change = feedback.r_change;
  ssubmit.new_rating = ssubmit.old_rating + ssubmit.r_change * (ssubmit.result * 2 - 1);
  ssubmit.combo = feedback.combo;
  ssubmit.new_combo = (ssubmit.result ? ssubmit.combo + 1 : 0);
  ssubmit.e_total = feedback.e_total;
  ssubmit.e_win = feedback.e_win;
  ssubmit.analyzeHistory(addHistory(feedback.e_history, ssubmit.result ? "○" : "×"));
});