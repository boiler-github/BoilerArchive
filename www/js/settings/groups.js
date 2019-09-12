module.controller('groupsController', function($scope, $timeout){
	const groups = this;
	groups.groupList = groupList;

	groups.proceed = function(group){
		settingsNavigator.once('prepop', function(){
    		$timeout(function(){
        		groups.groupList = groupList;
      		}, 100);
    	});
    	settingsNavigator.pushPage('groups_detail.html', {data: group});
  	}
});

module.controller('groupdetailController', function($scope, $timeout){
  	const groupdetail = this;
  	groupdetail.group = settingsNavigator.topPage.data;
  	if(!groupdetail.group.id){
    	groupdetail.group = {
      		name: "",
      		head: "",
    	};
  	}
	groupdetail.register = groupdetail.group.id;
  	groupdetail.isLoading = false;
  
  	groupdetail.updateGroup = function(){
    	const register = groupdetail.register;
    	const group = groupdetail.group;

    	var errors = [];
    	if(!group.name) errors.push("名前を入力してください。");
    	if(!group.head) errors.push("頭文字を入力してください。");
    	else if(!group.head.match(/^[ぁ-ん]$/)) errors.push("頭文字が正しくありません。");
	
	    if(errors.length > 0){
    		ons.notification.alert(errors.join("<br/>"), {title: "入力の不備"});
			return;
    	}

		groupdetail.isLoading = true;

	    insertGroup(group).then(function(){
    		ons.notification.alert("登録情報を更新しました。", {title: "情報更新"});
      		settingsNavigator.popPage();
    	});
	}
  
	groupdetail.confirmDelete = function(){
    	ons.notification.confirm(
      		"本当に削除してもいいですか？",
      		{
        		title: "確認",
        		callback: function(index){
          			if(index == 1) groupdetail.deleteGroup();
        		}
      		}
		);
	}
  
	groupdetail.deleteGroup = function(){
    	$scope.$apply(function(){
      		groupdetail.isLoading = true;
    	});
    
    	deleteGroup(groupdetail.group).then(function(){
      		ons.notification.alert("登録情報を削除しました。", {title: "情報削除"});
      		settingsNavigator.popPage();
    	});
  	}
});