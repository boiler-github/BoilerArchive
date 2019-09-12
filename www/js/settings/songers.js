module.controller('songersController', function($scope, $timeout){
	var songers = this;
	songers.songerList = songerList;

	songers.proceed = function(songer){
    	settingsNavigator.once('prepop', function(){
      		$timeout(function(){
        		songers.songerList = songerList;
      		}, 100);
    	});
    	settingsNavigator.pushPage('songers_detail.html', {data: songer});
  	}
});

module.controller('songerdetailController', function($scope, $timeout){
	var songerdetail = this;
  	songerdetail.songer = settingsNavigator.topPage.data;
  	if(!songerdetail.songer.id){
    	songerdetail.songer = {
      		name: "",
    	};
  	}
  	songerdetail.register = songerdetail.songer.id;
  	songerdetail.isLoading = false;
    
 	songerdetail.updateSonger = function(){
    	var register = songerdetail.register;
    	var songer = songerdetail.songer;

    	var errors = [];
    	if(!songer.name)errors.push("名前を入力してください。");
    	if(errors.length > 0){
      		ons.notification.alert(errors.join("<br/>"), {title: "入力の不備"});
      		return;
    	}
    
    	songerdetail.isLoading = true;
		insertSonger(songer).then(function(){
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
      		}
		);
  	}
  
  	songerdetail.deleteSonger = function(){
    	$scope.$apply(function(){
      		songerdetail.isLoading = true;
    	});

		deleteSonger(songerdetail.songer).then(function(){
      		ons.notification.alert("登録情報を削除しました。", {title: "情報削除"});
      		settingsNavigator.popPage();
    	});
  	}
});