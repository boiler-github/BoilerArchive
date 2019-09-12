module.controller('gametypesController', function($scope, $timeout){
	var gametypes = this;
	gametypes.typeList = gameTypeList;

 	gametypes.proceed = function(gameType){
    	settingsNavigator.once('prepop', function(){
      		$timeout(function(){
        		gametypes.typeList = gameTypeList;
      		}, 100);
    	});
    	settingsNavigator.pushPage('gametypes_detail.html', {data: gameType});
	}
});

module.controller('typedetailController', function($scope, $timeout){
  	var typedetail = this;
  	typedetail.type = settingsNavigator.topPage.data;
  	if(!typedetail.type.id){
   		typedetail.type = {
      		name: "",
      		isRegular: false,
    	};
  	}
  	typedetail.register = typedetail.type.id;
  	typedetail.isLoading = false;
  
  	typedetail.updateType = function(){
    	var register = typedetail.register;
    	var gameType = typedetail.type;

    	var errors = [];
    	if(!gameType.name)errors.push("名前を入力してください。");
    	if(errors.length > 0){
      		ons.notification.alert(errors.join("<br/>"), {title: "入力の不備"});
      		return;
    	}

    	typedetail.isLoading = true;
		insertGameType(gameType).then(function(){
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
      		}
		);
  	}
  
  	typedetail.deleteType = function(){
    	$scope.$apply(function(){
      		typedetail.isLoading = true;
    	});

		insertGameType(typedetail.type).then(function(){
			ons.notification.alert("登録情報を削除しました。", {title: "情報削除"});
      		settingsNavigator.popPage();
    	});
  	}
});