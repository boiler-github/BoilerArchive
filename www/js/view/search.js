module.controller('searchController', function($scope, $timeout){
  var search = this;
  search.isLoading = false;
  search.records = [];
  search.show = {};
  search.kana = kana;
  search.player_list = player_list;
  search.type_list = type_list;
  search.songer_list = songer_list;
  search.selected_type = {};
  search.details = ["運命戦", "束", "二束", "献上", "金星"];
  search.updated = [];

  $timeout(function(){
    search.date1 = sysstart;
    search.date2 = today();
  }, 200);
  
  search.showMatch = function(){
    var str = "";
    str += (search.player1 ? search.player1 : "＊＊＊");
    str += " ";
    if(search.result === undefined)str += "－";
    else str += (search.result ? "× ○" : "○ ×");
    str += " ";
    str += (search.player2 ? search.player2 : "＊＊＊");
    return str;
  }
  
  search.showChange = function(key){
    search.show[key] = !search.show[key];
  }
  
  search.showDetail = function(){
    var str = "";
    for(var key in search.selected_type){
      if(search.selected_type[key])str += key + ", ";
    }
    if(search.detail)str += search.detail + ", ";
    if(search.songer)str += search.songer + ", ";
    if(search.comment !== undefined)str += (search.comment ? "コメントあり" : "コメントなし");
    return str;
  }
  
  search.isStar = function(res, compare){
    if(compare == -1){
      return (res ? "☆" : "★");
    }
    return "";
  }
  
  //検索実行
  search.searchRecord = function(){
    search.isLoading = true;
    searchMenu.setMainPage('search_result.html');

    var records = [];
    
    var query = Record.order("date", true);

    //対戦
    if(search.result !== undefined){
      if(!search.result){
        if(search.player1)query.equalTo("winner", search.player1);
        if(search.player2)query.equalTo("loser", search.player2);
      }else{
        if(search.player1)query.equalTo("loser", search.player1);
        if(search.player2)query.equalTo("winner", search.player2);
      }
    }
    else{
      if(search.player1 && search.player2){
        var players = [search.player1, search.player2];
        query.in("winner", players)
          .in("loser", players);
      }
      else{
        var name = "";
        if(search.player1)name = search.player1;
        if(search.player2)name = search.player2;
        if(name){
          query.or([
            Record.equalTo("winner", name),
            Record.equalTo("loser", name),
          ]);
        }
      }
    }
          
    //日付
    query.greaterThanOrEqualTo("date", search.date1)
      .lessThanOrEqualTo("date", search.date2);
      
    //試合形式
    var q_type = [];
    for(var key in search.selected_type){
      if(search.selected_type[key])q_type.push(key);
    }
    if(q_type.length > 0)query.in("type", q_type);
    
    //試合結果
    var detail = search.detail;
    if(detail == "運命戦")query.equalTo("diff", 1);
    if(detail == "束")query.greaterThanOrEqualTo("diff", 10);
    if(detail == "二束")query.greaterThanOrEqualTo("diff", 20);
    if(detail == "献上"){
      query.equalTo("loser", search.player1)
        .equalTo("compareClass", -1);
    }
    if(detail == "金星"){
      query.equalTo("winner", search.player1)
        .equalTo("compareClass", -1);
    }
    
    //読手
    if(search.songer)query.equalTo("songer", search.songer);
    
    //コメント
    if(search.comment !== undefined){
      query.exists("comment", search.comment);
    }

    query.count()
      .fetchAll()
      .then(function(results){
        var records = [];
        var last_date = "";
        var index = -1;
        results.forEach(function(record){
          var date = record.date;
          if(date != last_date){
            last_date = date;
            records.push({
              date: last_date,
              games: []
            });
            index++;
          }
/*          var winner, loser;
          Object.keys(player_list).forEach(function(head){
            player_list[head].forEach(function(player){
              if(player.name == opponent_name)opponent = player;
            });
          });*/
          records[index].games.push({
            date: date,
            round: record.round,
            winner: record.winner,
            loser: record.loser,
            diff: record.diff,
            order: record.order,
            songer: record.songer,
            comment: record.comment,
            type: record.type,
            compareClass: record.compareClass,
          });
        });
        
        $timeout(function(){
          search.count = results.count;
          search.records = records;
          search.isLoading = false;   
        }, 100);
      });
  }

  search.widths = ["7%", "25%", "18%", "25%", "20%", "5%"];

  //表示用配列
  search.arrange = function(game){
    var ret = [];
    ret.push(game.round);
    if(game.type == SINGLE){
      ret.push(game.winner);
      ret.push("");
      ret.push("");
      ret.push(game.type);
    }
    else{
      var type = (isRegularType(game.type) ? "" : game.type);
      if(game.order){
        ret.push(game.winner);
        ret.push("○ " + game.diff + " ×");
        ret.push(game.loser);
      }
      else{
        ret.push(game.loser);
        ret.push("× " + game.diff + " ○");
        ret.push(game.winner);
      }
      ret.push(type);
    }
    ret.push(search.isStar(game.order, game.compareClass));
    return ret;
  }
  
  search.pageDetail = function(game){
    search.game = game;
    search.forEdit = false;
    $timeout(function(){
      search.new_date = game.date;
      search.new_round = game.round;
      search.new_diff = game.diff;
      search.new_result = !game.order;
      search.new_type = game.type;
      search.new_comment = game.comment;
      search.new_songer = game.songer;
    }, 200);
    searchMenu.setMainPage('search_detail.html');
  }
  
  search.showResult = function(game){
    if(game.type == SINGLE)return game.winner;
    var str = "";
    if(game.order){
      str += game.winner + " ○ " + game.diff + " × " + game.loser;
    }
    else{
     str += game.loser + " × " + game.diff + " ○ " + game.winner;
    }
    str += search.isStar(game.order, game.compareClass);
    return str;
  }
  
  search.updateRecord = function(){
    search.isLoading = true;
    var game = search.game;
    var date = game.date;
    var round = game.round;
    var new_game = {
      order: game.order,
    };
    new_game.date = search.new_date;
    new_game.round = parseInt(search.new_round);
    new_game.diff = parseInt(search.new_diff);
    new_game.type = search.new_type;
    var winner = game.winner;
    var loser = game.loser;
    if(search.new_result){
      new_game.loser = winner;
      new_game.winner = loser;
    }
    else{
      new_game.winner = winner;
      new_game.loser = loser;
    }
    new_game.songer = search.new_songer;
    new_game.comment = search.new_comment;
    new_game.compareClass = (new_game.winner == game.winner ? 1 : -1) * game.compareClass;
    search.updated.push(new_game);
    game.updated = true;
    search.modifyDelete(game)
      .then(function(){
        search.modifyAdd(new_game);
      });
    
    Record.equalTo("date", date)
      .equalTo("round", round)
      .equalTo("winner", winner)
      .equalTo("loser", loser)
      .fetch()
      .then(function(res){
        res.set("date", new_game.date)
          .set("round", new_game.round)
          .set("winner", new_game.winner)
          .set("loser", new_game.loser)
          .set("diff", new_game.diff)
          .set("type", new_game.type)
          .set("songer", new_game.songer)
          .set("comment", new_game.comment)
          .set("compareClass", new_game.compareClass)
          .update()
          .then(function(){
            $scope.$apply(function(){
              search.isLoading = false;            
            });
            ons.notification.alert("記録を更新しました。", {title: "記録更新"});
            searchMenu.setMainPage('search_result.html');
          });
      });
  }
  
  search.deleteRecord = function(){
    var game = search.game;
    ons.notification.confirm(
      "本当に削除してよろしいですか？", 
      {
        title: "確認",
        callback: function(index){
          if(index == 1){
            Record.equalTo("date", game.date)
              .equalTo("round", game.round)
              .equalTo("winner", game.winner)
              .equalTo("loser", game.loser)
              .fetch()
              .then(function(res){
                res.delete()
                  .then(function(){
                    game.updated = true;
                    ons.notification.alert("記録を削除しました", {title: "記録削除"});
                    searchMenu.setMainPage('search_result.html');
                  });
              });
            search.modifyDelete(game);
          }
        }
      });
  }
  
  search.modifyDelete = function(game){
    //個人戦績等の修正
    var winner, loser;
    var p1 = 
      Member.equalTo("name", game.winner)
        .fetch()
        .then(function(res){
          winner = res;
        });
        
    var p2 =
      Member.equalTo("name", game.loser)
        .fetch()
        .then(function(res){
          loser = res;
        });

    return Promise.all([p1, p2])
      .then(function(){
        var r_change = 0;
        var ps = [];
        if(winner && loser)r_change = calcRating(winner.rating, loser.rating);
        if(isRegularType(game.type)){
          if(winner){
            var p_results = JSON.parse(winner.results);
            if(!p_results)p_results = {};
            if(p_results[loser.name]){
              var res = p_results[loser.name];
              p_results[loser.name] = [res[0] - 1, res[1] - 1, res[2]];
            }
            ps.push(
              winner.setIncrement("rating", -r_change)
                .setIncrement("sumDiff", -game.diff)
                .setIncrement("total", -1)
                .setIncrement("win", -1)
                .set("results", JSON.stringify(p_results))
                .update()
            );
          }
          
          if(loser){
            var p_results = JSON.parse(loser.results);
            if(!p_results)p_results = {};
            if(p_results[winner.name]){
              var res = p_results[winner.name];
              p_results[winner.name] = [res[0] - 1, res[1], res[2]];
            }
            ps.push(
              loser.setIncrement("rating", r_change)
                .setIncrement("sumDiff", game.diff)
                .setIncrement("total", -1)
                .set("results", JSON.stringify(p_results))
                .update()
            );
          }
        }
        return Promise.all(ps);
      });
  }
  
  search.modifyAdd = function(game){
    //個人戦績等の修正
    var winner, loser;
    var p1 = 
      Member.equalTo("name", game.winner)
        .fetch()
        .then(function(res){
          winner = res;
        });
        
    var p2 =
      Member.equalTo("name", game.loser)
        .fetch()
        .then(function(res){
          loser = res;
        });

    return Promise.all([p1, p2])
      .then(function(){
        var r_change = 0;
        var ps = [];
        if(winner && loser)r_change = calcRating(winner.rating, loser.rating);
        if(isRegularType(game.type)){
          if(winner){
            var p_results = JSON.parse(winner.results);
            if(!p_results)p_results = {};
            if(p_results[loser.name]){
              var res = p_results[loser.name];
              p_results[loser.name] = [res[0] + 1, res[1] + 1, res[2]];
            }
            ps.push(
              winner.setIncrement("rating", r_change)
                .setIncrement("sumDiff", game.diff)
                .setIncrement("total", 1)
                .setIncrement("win", 1)
                .set("results", JSON.stringify(p_results))
                .update()
            );
          }
          
          if(loser){
            var p_results = JSON.parse(loser.results);
            if(!p_results)p_results = {};
            if(p_results[winner.name]){
              var res = p_results[winner.name];
              p_results[winner.name] = [res[0] + 1, res[1], res[2]];
            }
            ps.push(
              loser.setIncrement("rating", -r_change)
                .setIncrement("sumDiff", -game.diff)
                .setIncrement("total", 1)
                .set("results", JSON.stringify(p_results))
                .update()
            );
          }
        }
        return Promise.all(ps);
      });
  }
});