module.controller('cresultController', function($scope, $timeout){
  var cresult = this;
  cresult.kana = kana;
  cresult.player_list = player_list;
  cresult.isLoading = false;

  cresult.showClass = showClass;
  cresult.showGrade = showGrade;
  
  cresult.search = function(){
    cresult.isLoading = true;
    cresultMenu.setMainPage('cresult_index.html');
    var name = cresult.player_name;
    getMember(name)
      .then(function(member){
        cresult.player = member;
        $timeout(function(){
          cresult.isLoading = false;
        }, 2000);
      })

    var contests = {};
    ContestRecord.equalTo("player", name)
      .fetchAll()
      .then(function(results){
        if(results){
          results.forEach(function(game){
            if(!contests[game.contest])contests[game.contest] = [game.class];
            contests[game.contest].push({
              round: game.round,
              opponent: game.opponent,
              result: game.result,
              diff: game.diff,
              belong: game.belong,
            });
          });
        }
      });
    cresult.contests = contests;
    
    var ps = [];
    var totals = [];
    for(var round = 1; round <= 10; round++){
      ps.push(
        ContestRecord.equalTo("player", name)
          .equalTo("round", round)
          .count()
          .fetchAll()
          .then(function(results){
            totals.push(results.count);
          })
      );
    }
    
    cresult.count = [];
    
    Promise.all(ps)
      .then(function(){
        totals.sort();
        totals.reverse();
        cresult.count.push(["通算", totals[0]]);
        for(var round = 1; round < 10; round++)totals[round - 1] = totals[round - 1] - totals[round];
        cresult.totals = totals;
      })
      .then(function(){
        return ContestInfo.equalTo("completed", true)
          .greaterThanOrEqualTo("date", cresult.player.upgradeDate)
          .regularExpressionTo("classes", name)
          .count()
          .fetchAll()
          .then(function(results){
            cresult.count.push(["昇級後", results.count]);
          });
      })
      .then(function(){
        return ContestInfo.equalTo("completed", true)
          .greaterThanOrEqualTo("date", semester)
          .regularExpressionTo("classes", name)
          .count()
          .fetchAll()
          .then(function(results){
            $scope.$apply(function(){
              cresult.count.push(["今期", results.count]);
            });
          });
      });
  }

  cresult.widths = ["10%", "20%", "70%"];
  
  cresult.arrange = function(game){
    var ret = [];
    ret.push(game.round);
    if(game.result)ret.push("○" + game.diff);
    else ret.push("×" + game.diff);
    ret.push(game.opponent + "(" + game.belong + ")");
    return ret;
  }

  //ログイン時
  if(login_player){
    cresult.player_name = login_player;
    $timeout(cresult.search, 100);
  }  
});