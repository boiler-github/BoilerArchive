module.controller('membersController', function($scope, $timeout){
  var members = this;
  members.member_list = member_list;

  members.proceed = function(data){
    settingsNavigator.once('prepop', function(){
      $timeout(function(){
        members.member_list = member_list;
      }, 100);
    });
    settingsNavigator.pushPage('members_detail.html', data);
  }
});

module.controller('memberdetailController', function($scope, $timeout){
  var memberdetail = this;
  memberdetail.classes = classes;

  memberdetail.member = settingsNavigator.topPage.data;
  if(!memberdetail.member.name){
    memberdetail.member = {
      name: "",
      head: "",
      class: classes[0],
      grade: "",
      upgradeDate: today(),
    };
  }
  var upgradeDate = memberdetail.member.upgradeDate;
  memberdetail.member.upgradeDate = "";
  $timeout(function(){
    memberdetail.member.upgradeDate = upgradeDate;
  }, 100);
  memberdetail.register = memberdetail.member.name;
  memberdetail.isLoading = false;
    
  memberdetail.validate = function(member){
    var errors = [];
    if(!member.name)
      errors.push("名前を入力してください。");
    else if(!member.name.match(/^[^\s\w!-~]+ [^\s\w!-~]+$/))
      errors.push("名前が正しくありません。(姓と名の間は半角スペース)");
    if(!member.head)
      errors.push("頭文字を入力してください。");
    else if(!member.head.match(/^[ぁ-ん]$/))
      errors.push("頭文字が正しくありません。");
    if(!member.class)
      errors.push("級を選択してください。");
    if(!member.grade)
      errors.push("学年を入力してください。");
    else if(!member.grade.match(/^\w+$/))
      errors.push("学年が正しくありません。(半角英数字)");
    if(!member.upgradeDate)
      errors.push("昇段日を入力してください。");
    
    return errors;
  }
  
  memberdetail.updateMember = function(){
    var register = memberdetail.register;
    var member = memberdetail.member;
    var promise = null;

    var errors = memberdetail.validate(member);
    if(errors.length > 0){
      ons.notification.alert(errors.join("<br/>"), {title: "入力の不備"});
      return;
    }

    memberdetail.isLoading = true;
    if(register){
      promise = 
        updateMember(register, function(member_obj){
          return member_obj.set("name", member.name)
                  .set("head", member.head)
                  .set("class", member.class)
                  .set("grade", member.grade)
                  .set("upgradeDate", member.upgradeDate)
                  .set("updated", true)
                  .update();
        });
        
      if(member.name != register){
        replaceName(register, member.name);
      }
    }
    else{
      var member_obj = new Member();
      promise = 
        member_obj.set("name", member.name)
          .set("head", member.head)
          .set("class", member.class)
          .set("grade", member.grade)
          .set("upgradeDate", member.upgradeDate)
          .set("rating", 1500)
          .set("sumDiff", 0)
          .set("total", 0)
          .set("win", 0)
          .set("updated", true)
          .save()
          .then(function(){
            makeMemberList();
            makePlayerList();
          });
    }
    promise.then(function(){
      ons.notification.alert("登録情報を更新しました。", {title: "情報更新"});
      settingsNavigator.popPage();
    });
  }
  
  memberdetail.confirmDelete = function(){
    ons.notification.confirm(
      "本当に削除してもいいですか？",
      {
        title: "確認",
        callback: function(index){
          if(index == 1)memberdetail.deleteMember();
        }
      });
  }
  
  memberdetail.deleteMember = function(){
    $scope.$apply(function(){
      memberdetail.isLoading = true;
    });
    var register = memberdetail.register;
    updateMember(register, function(member_obj){
      return member_obj.delete();
    })
    .then(function(){
      ons.notification.alert("登録情報を削除しました。", {title: "情報削除"});
      settingsNavigator.popPage();
    });
  }
});