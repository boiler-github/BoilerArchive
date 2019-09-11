module.controller('songersController', function($scope, $timeout){
  var songers = this;
  songers.songer_list = songer_list;

  songers.proceed = function(data){
    settingsNavigator.once('prepop', function(){
      $timeout(function(){
        songers.songer_list = songer_list;
      }, 100);
    });
    settingsNavigator.pushPage('songers_detail.html', data);
  }
});

module.controller('songerdetailController', function($scope, $timeout){
  var songerdetail = this;
  songerdetail.songer = settingsNavigator.topPage.data;
  if(!songerdetail.songer.name){
    songerdetail.songer = {
      name: "",
      id: songer_list.length,
    };
  }
  songerdetail.register = songerdetail.songer.name;
  songerdetail.isLoading = false;
  
  songerdetail.addID = function(num){
    songerdetail.songer.id += num;
  }
  
  songerdetail.updateSonger = function(){
    var register = songerdetail.register;
    var songer = songerdetail.songer;
    var promise = null;

    var errors = [];
    if(!songer.name)errors.push("名前を入力してください。");
    if(!songer.id)errors.push("表示順を入力してください。");
    if(errors.length > 0){
      ons.notification.alert(errors.join("<br/>"), {title: "入力の不備"});
      return;
    }
    
    songerdetail.isLoading = true;
    if(register){
      promise = 
        updateSonger(register, function(songer_obj){
          return songer_obj.set("name", songer.name)
                  .set("id", parseInt(songer.id))
                  .set("count", parseInt(0))
                  .update();
        });
        
      if(songer.name != register){
        replaceRecords("songer", register, songer.name);
      }
    }
    else{
      var songer_obj = new Songer();
      promise = 
        songer_obj.set("name", songer.name)
          .set("id", parseInt(songer.id))
          .save()
          .then(makeSongerList);
    }
    promise.then(function(){
      ons.notification.alert("登録情報を更新しました。", {title: "情報更新"});
      settingsNavigator.popPage();
    });
  }
  
  songerdetail.confirmDelete = function(){
    ons.notification.confirm(
      "本当に削除してもいいですか？",
      {
        title: "確認",
        callback: function(index){
          if(index == 1)songerdetail.deleteSonger();
        }
      });
  }
  
  songerdetail.deleteSonger = function(){
    $scope.$apply(function(){
      songerdetail.isLoading = true;
    });
    var register = songerdetail.register;
    updateSonger(register, function(songer_obj){
      return songer_obj.delete();
    })
    .then(function(){
      ons.notification.alert("登録情報を削除しました。", {title: "情報削除"});
      settingsNavigator.popPage();
    });
  }
});