module.controller('gametypesController', function($scope, $timeout){
  var gametypes = this;
  gametypes.type_list = type_list;

  gametypes.proceed = function(data){
    settingsNavigator.once('prepop', function(){
      $timeout(function(){
        gametypes.type_list = type_list;
      }, 100);
    });
    settingsNavigator.pushPage('gametypes_detail.html', data);
  }
});

module.controller('typedetailController', function($scope, $timeout){
  var typedetail = this;
  typedetail.type = settingsNavigator.topPage.data;
  if(!typedetail.type.name){
    typedetail.type = {
      name: "",
      id: type_list.length,
      isRegular: false,
    };
  }
  typedetail.register = typedetail.type.name;
  typedetail.isLoading = false;
  
  typedetail.addID = function(num){
    typedetail.type.id += num;
  }
  
  typedetail.updateType = function(){
    var register = typedetail.register;
    var type = typedetail.type;
    var promise = null;

    var errors = [];
    if(!type.name)errors.push("名前を入力してください。");
    if(!type.id)errors.push("表示順を入力してください。");
    if(errors.length > 0){
      ons.notification.alert(errors.join("<br/>"), {title: "入力の不備"});
      return;
    }

    typedetail.isLoading = true;
    if(register){
      promise = 
        updateType(register, function(type_obj){
          return type_obj.set("name", type.name)
                  .set("id", parseInt(type.id))
                  .set("isRegular", type.isRegular)
                  .update();
        });
      
      if(type.name != register){
        replaceRecords("type", register, type.name);
      }

    }
    else{
      var type_obj = new GameType();
      promise = 
        type_obj.set("name", type.name)
          .set("id", parseInt(type.id))
          .set("isRegular", type.isRegular)
          .save()
          .then(makeTypeList);
    }
    promise.then(function(){
      ons.notification.alert("登録情報を更新しました。", {title: "情報更新"});
      settingsNavigator.popPage();
    });
  }
  
  typedetail.confirmDelete = function(){
    ons.notification.confirm(
      "本当に削除してもいいですか？",
      {
        title: "確認",
        callback: function(index){
          if(index == 1)typedetail.deleteType();
        }
      });
  }
  
  typedetail.deleteType = function(){
    $scope.$apply(function(){
      typedetail.isLoading = true;
    });
    var register = typedetail.register;
    updateType(register, function(type_obj){
      return type_obj.delete();
    })
    .then(function(){
      ons.notification.alert("登録情報を削除しました。", {title: "情報削除"});
      settingsNavigator.popPage();
    });
  }
});