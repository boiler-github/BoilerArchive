module.controller('envController', function($scope, $timeout){
  var env = this;
  env.date = "";
  $timeout(function(){
    env.date = pre_date;
  }, 100);
  env.round = pre_round + 1;
  env.songer = songer_list[0].name;
  env.songer_list = songer_list;
  
  //+-ボタン
  env.addRound = function(num){
    env.round = Math.max(parseInt(env.round) + num, 1);
  }
  
  env.proceed = function(){
/*    if(this.songer){
      editNavigator.pushPage('player.html',
        {data: {date: this.date, round: this.round, songer: this.songer}});
    }
    else ons.notification.alert("読手を選択してください", {title: "入力に不備があります"});
  }*/
    pre_date = env.date;
    pre_round = env.round;
    
    localStorage.setItem('pre_date', pre_date);
    localStorage.setItem('pre_round', pre_round);
    
    editNavigator.pushPage('player_all.html',
      {data: {date: env.date, round: env.round, songer: env.songer}});
  }
});

module.controller('playerController', function(){
  var player = this;
  player.kana = kana;
  player.show = "";
  player.checked = {};
  player.order = [];
  player.player_list = player_list;
  player.group_index = group_index;
  //前画面からの引き継ぎデータ
  player.env = editNavigator.topPage.data;

  //ゲスト追加用
  player.classes = classes;
  player.guest = 
  {
    name: "",
    head: "",
    class: classes[0],
    belong: group_list[0].name,
    isMember: false,
  };
  player.registered = [];
  
  pre_players.forEach(function(member){
    player.checked[member.name] = member;
  });

  //参加者管理
  player.toggleCheck = function(member){
    if(player.checked[member.name])delete player.checked[member.name];
    else player.checked[member.name] = member;
  }
  
  player.setOrder = function(name){
    var index = player.order.indexOf(name);
    if(index == -1){
      var i;
      for(i = 0; i < player.order.length; i++){
        if(!player.order[i]){
          player.order[i] = name;
          break;
        }
      }
      if(i == player.order.length)player.order.push(name);
    }
    else player.order[index] = null;
  }

  //対戦相手取得
  player.getOpponent = function(name){
    var index = player.order.indexOf(name);
    if(index == -1)return "";
/*    var opp = index + 1 - (index % 2) * 2;
    if(opp == player.order.length || !player.order[opp])return "";
    else return "－" + player.order[opp];
    */
    return parseInt((index / 2) + 1);
  }
  
  //次の画面への遷移
  player.proceed = function(){
    var selected = [];
    for(var i = 0; i < player.order.length; i++){
      if(player.order[i]){
        selected.push(player.checked[player.order[i]]);
      }
    }
    
    if(selected.length == 0){
      ons.notification.alert("対戦者を選択してください。", {title: "入力の不備"});
      return;
    }

    pre_players = selected;
    localStorage.setItem('pre_players', JSON.stringify(selected));
    
    editNavigator.pushPage('result_all.html',
      {data: {env: player.env, players: selected}});
  }
  
  player.validate = function(guest){
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
  player.registerGuest = function(){
    var guest = player.guest;
    
    var errors = player.validate(guest);
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
      player.registered.push(guest);
      player.guest = 
      {
        name: "",
        head: "",
        class: player.classes[0],
        belong: group_list[0].name,
        isMember: false,
      };
    }
  }
});

module.controller('resultsController', function(){
  var results = this;
  var data = editNavigator.topPage.data;
  var players = data.players;
  var games = [];
  var pracs = [];
  var i = 0;
  
  //組み合わせの計算
  while(players[i] || players[i + 1]){
    if(players[i] && players[i + 1]){
      var diff = classDiff(players[i].class, players[i + 1].class);
      games.push({
        player1: players[i],
        player2: players[i + 1],
        result: diff > 0,
        diff: (Math.abs(diff) + 1) * 5,
        type: "0",
        comment: "",
      });
    }else if(players[i])pracs.push({player: players[i], comment: ""});
    else pracs.push({player: players[i + 1], comment: ""});
    i += 2;
  }
  
  results.games = games;
  results.pracs = pracs;
  results.type_list = type_list;
  results.env = data.env;
  
  //+-ボタン
  results.addDiff = function(index, num){
    var diff = results.games[index].diff + num;
    if(diff < 1)diff = 1;
    if(diff > 50)diff = 50;
    results.games[index].diff = diff;
  }
      
  //情報送信
  results.sendData = function(){
    var date = results.env.date;
    var round = results.env.round;
    var songer = results.env.songer;
    //試合
    results.games.forEach(function(game){
      var winner = game.player1;
      var loser = game.player2;
      var order = true;
      if(game.result){
        winner = game.player2;
        loser = game.player1;
        order = false;
      }
      var record = new Record();
      record.set("date", date)
            .set("round", parseInt(round))
            .set("songer", songer)
            .set("winner", winner.name)
            .set("loser", loser.name)
            .set("compareClass", compareClass(winner.class, loser.class))
            .set("diff", parseInt(game.diff))
            .set("type", type_list[game.type].name)
            .set("comment", game.comment)
            .set("order", order)
            .save();
            
      if(winner.isMember && loser.isMember && type_list[game.type].isRegular){
        var r_change = calcRating(winner.rating, loser.rating);

        updateMember(winner.name, function(member_obj){
          var p_results = JSON.parse(member_obj.results);
          if(!p_results)p_results = {};
          if(p_results[loser.name]){
            var res = p_results[loser.name];
            p_results[loser.name] = [res[0] + 1, res[1] + 1, addHistory(res[2], "○")];
          }
          else p_results[loser.name] = [1, 1, "○"];
          return member_obj.setIncrement("rating", r_change)
                  .setIncrement("sumDiff", game.diff)
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
                  .setIncrement("sumDiff", -game.diff)
                  .setIncrement("total", 1)
                  .set("results", JSON.stringify(p_results))
                  .update();
        });
      }
      else{
        if(winner.isMember){
          updateMember(winner.name, function(member_obj){
            return member_obj.setIncrement("sumDiff", game.diff)
                    .setIncrement("total", 1)
                    .setIncrement("win", 1)
                    .update();
          });
        }

        if(loser.isMember){
          updateMember(loser.name, function(member_obj){
            return member_obj.setIncrement("sumDiff", -game.diff)
                    .setIncrement("total", 1)
                    .update();
          });
        }
      }
    });
    //一人取り
    results.pracs.forEach(function(prac){
      var record = new Record();
      record.set("date", date)
            .set("round", parseInt(round))
            .set("songer", songer)
            .set("winner", prac.player.name)
            .set("type", SINGLE)
            .set("comment", prac.comment)
            .save();
    });
    
    updateSonger(songer, function(songer_obj){
      songer_obj.setIncrement("count", 1)
        .update();
    });

    var count = results.games.length + results.pracs.length;
    editNavigator.pushPage('submit_all.html', {data: {count: count, games: results.games, pracs: results.pracs}});
  }
});

module.controller('submitController', function(){
  var submit = this;
  var data = editNavigator.topPage.data;
  submit.count = data.count;
  submit.games = data.games;
  submit.pracs = data.pracs;

  submit.isStar = function(res, compare){
    if(compare == -1 && res)return "☆";
    if(compare == 1 && !res)return "★";
    return "";
  }

  submit.widths = ["25%", "18%", "25%", "20%", "5%"];

  //表示用配列
  submit.arrange = function(game){
    var ret = [];
    if(!game.player1){
      ret.push(game.player.name);
      ret.push("");
      ret.push("");
      ret.push("一人取り");
      ret.push("");
    }
    else{
      var type = type_list[game.type].name;
      type = (isRegularType(type) ? "" : type);
      ret.push(game.player1.name);
      if(!game.result)ret.push("○ " + game.diff + " ×");
      else ret.push("× " + game.diff + " ○");
      ret.push(game.player2.name);
      ret.push(type);
      ret.push(submit.isStar(!game.result, compareClass(game.player1.class, game.player2.class)));
    }
    return ret;
  }
});