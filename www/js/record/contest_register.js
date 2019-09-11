module.controller('cregisterController', function($scope, $timeout){
  var cregister = this;
  cregister.kana = kana;
  cregister.player_list = player_list;

  $timeout(function(){
    cregister.date = today();
  }, 100);
  
  cregister.classes = [];
  cregister.checked = [];

  cregister.addClass = function(){
    $timeout(function(){
      cregister.classes.push({
        name: "", total: 64,
      });
    }, 100);
  }
  
  //参加者管理
  cregister.toggleCheck = function(name){
    var index = cregister.checked.indexOf(name);
    //登録
    if(index == -1)cregister.checked.push(name);
    else cregister.checked[index] = null; //削除
  }
  
  //表示切替
  cregister.showChange = function(index){
    cregister.show[index] = !cregister.show[index];
  }
    
  cregister.proceed = function(){
    var players = [];
    cregister.checked.forEach(function(player){
      if(player)players.push(player);
    });
      
    var errors = [];

    if(!cregister.name)
      errors.push("大会名称が入力されていません。");
    else if(!cregister.name.match(/^[^\s\w!-~]+$/))
      errors.push("大会名称が正しくありません。");
    if(cregister.classes.length == 0)
      errors.push("クラスが設定されていません。");
    else{
      cregister.classes.forEach(function(cl, key){
        var name = cl.name;
        if(!name)errors.push((key + 1) + "番目のクラス名が入力されていません。");
        else if(!name.match(/^\w+$/))errors.push("クラス名には英数字を用いてください。(クラス" + name + ")");
      });
    }
    if(players.length == 0)
        errors.push("参加者が選択されていません。");
    
    if(errors.length > 0)ons.notification.alert(errors.join("<br/>"), {title: "入力の不備"});
    else{
      editNavigator.pushPage('cregister_players.html', {data: {name: cregister.name, date: cregister.date, players: players, classes: cregister.classes}});
    }
  }
});

module.controller('cplayersController', function($scope, $timeout){
  var cplayers = this;
  var data = editNavigator.topPage.data;
  cplayers.classes = data.classes;
  cplayers.players = [];
  data.players.forEach(function(player_name){
    cplayers.players.push({
      name: player_name,
      class: cplayers.classes[0].name,
    });
  });
  
  cplayers.proceed = function(){
    var classes = {};
    cplayers.classes.forEach(function(cl){
      classes[cl.name] = {
        players: [],
        total: cl.total,
      };
    });
    
    cplayers.players.forEach(function(player){
      classes[player.class].players.push({
        name: player.name,
        round: 1,
      });
    });
    
    var contest_info = new ContestInfo();
    contest_info.set("name", data.name)
      .set("date", data.date)
      .set("classes", JSON.stringify(classes))
      .set("completed", false)
      .save()
      .then(function(){
        makeContestList();
      })

    editNavigator.pushPage('cregister_submit.html', {data: {data: data, classes: classes}});
  }
});

module.controller('csubmitController', function($scope, $timeout){
  var csubmit = this;
  var data = editNavigator.topPage.data;
  csubmit.data = data.data;
  csubmit.classes = data.classes;
});