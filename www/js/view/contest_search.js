module.controller('csearchController', function($scope, $timeout){
  var csearch = this;
  csearch.isLoading = false;
  csearch.records = [];
  csearch.show = {};
  csearch.group_index = group_index;
  csearch.kana = kana;

/*  csearch.kana = kana;
  csearch.player_list = player_list;
  csearch.type_list = type_list;
  csearch.songer_list = songer_list;
  csearch.selected_type = {};
  csearch.details = ["運命戦", "束", "二束", "献上", "金星"];
  csearch.updated = [];*/

  $timeout(function(){
    csearch.date1 = sysstart;
    csearch.date2 = today();
  }, 200);
  
  /*
  csearch.showMatch = function(){
    var str = "";
    str += (csearch.player1 ? csearch.player1 : "＊＊＊");
    str += " ";
    if(csearch.result === undefined)str += "－";
    else str += (csearch.result ? "× ○" : "○ ×");
    str += " ";
    str += (csearch.player2 ? csearch.player2 : "＊＊＊");
    return str;
  }*/
  
  csearch.showChange = function(key){
    csearch.show[key] = !csearch.show[key];
  }
  /*
  csearch.showDetail = function(){
    var str = "";
    for(var key in csearch.selected_type){
      if(csearch.selected_type[key])str += key + ", ";
    }
    if(csearch.detail)str += csearch.detail + ", ";
    if(csearch.songer)str += csearch.songer + ", ";
    if(csearch.comment !== undefined)str += (csearch.comment ? "コメントあり" : "コメントなし");
    return str;
  }
  
  csearch.isStar = function(res, compare){
    if(compare == -1){
      return (res ? "☆" : "★");
    }
    return "";
  }*/
  
  //検索実行
  csearch.searchRecord = function(){
    csearch.isLoading = true;
    csearchMenu.setMainPage('csearch_result.html');

    var records = [];
    
    var query = ContestInfo.order("date", true)
                  .equalTo("completed", true);

    //日付
    query.greaterThanOrEqualTo("date", csearch.date1)
      .lessThanOrEqualTo("date", csearch.date2);
    
    //大会名
    if(csearch.like)query.regularExpressionTo("name", csearch.like);

    query.count()
      .fetchAll()
      .then(function(results){
        results.forEach(function(record){
          var analysis = csearch.analyze(record.classes);
          records.push({
            name: record.name,
            date: record.date,
            all: analysis.all,
            classes: analysis.classes,
          });
        });
        
        $timeout(function(){
          csearch.count = results.count;
          csearch.records = records;
          csearch.isLoading = false;   
        }, 100);
      });
  }
  
  csearch.analyze = function(str){
    var data = JSON.parse(str);
    var ret = [];
    var all = 0;
    for(var key in data){
      var total = data[key].total;
      var players = [];
      data[key].players.forEach(function(player){
        players.push(player.name);
      });
      ret.push([key, total, players]);
      all += players.length;
    }
    return {
      all: all,
      classes: ret,
    };
  }
  
  csearch.pageDetail = function(record){
    csearch.record = record;
    csearch.isLoading = true;
    csearchMenu.setMainPage('csearch_detail.html');
    ContestRecord.equalTo("contest", record.name)
      .fetchAll()
      .then(function(games){
        csearch.games = {};
        games.forEach(function(game){
          if(!csearch.games[game.round])csearch.games[game.round] = {};
          var cont = csearch.games[game.round];
          if(!cont[game.class])cont[game.class] = [];
          cont[game.class].push(game);
        });
  
        $scope.$apply(function(){
          csearch.isLoading = false;
        });
      });
  }

  csearch.widths = ["25%", "15%", "25%", "35%"];

  csearch.arrange = function(game){
    var ret = [];
    ret.push(game.player);
    if(game.result)ret.push("○" + game.diff + "×");
    else ret.push("×" + game.diff + "○");
    ret.push(game.opponent);
    ret.push(game.belong);
    return ret;
  }

  csearch.pageEdit = function(admin, game){
    if(!admin)return;
    csearch.game = game;
    csearch.diff = game.diff;
    csearch.opponent = game.opponent;
    csearch.belong = game.belong;
    csearchMenu.setMainPage('csearch_edit.html');
  }
  
  csearch.updateRecord = function(){
    var game = csearch.game;
    ContestRecord.equalTo("contest", game.contest)
      .equalTo("class", game.class)
      .equalTo("round", game.round)
      .equalTo("player", game.player)
      .fetch()
      .then(function(record){
        record.set("diff", csearch.diff)
          .set("opponent", csearch.opponent)
          .set("belong", csearch.belong)
          .update()
          .then(function(){
            game.diff = csearch.diff;
            game.opponent = csearch.opponent;
            game.belong = csearch.belong;
            ons.notification.alert("記録を更新しました。", {title: "記録更新"});
            csearchMenu.setMainPage('csearch_detail.html');
          });
      });
  }

  var name = viewNavigator.topPage.data.name;
  
  if(name){
    $timeout(function(){
      csearch.isLoading = true;
      csearchMenu.setMainPage('csearch_detail.html');
    });

    ContestInfo.equalTo("name", name)
      .fetch()
      .then(function(result){
        var analysis = csearch.analyze(result.classes);
        var record = {
          name: result.name,
          date: result.date,
          all: analysis.all,
          classes: analysis.classes,
        };
        csearch.pageDetail(record);
      });
  }
});