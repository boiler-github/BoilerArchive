module.controller('guestsController', function($scope, $timeout){
  var guests = this;
  guests.guest_list = guest_list;

  guests.proceed = function(data){
    settingsNavigator.once('prepop', function(){
      $timeout(function(){
        guests.guest_list = guest_list;
      }, 100);
    });
    settingsNavigator.pushPage('guests_detail.html', data);
  }
});

module.controller('guestdetailController', function($scope, $timeout){
  var guestdetail = this;
  guestdetail.classes = classes;
  guestdetail.group_index = group_index;
  guestdetail.kana = kana;
  guestdetail.show = "";

  guestdetail.guest = settingsNavigator.topPage.data;
  if(!guestdetail.guest.name){
    guestdetail.guest = {
      name: "",
      head: "",
      class: classes[0],
    };
  }
  guestdetail.register = guestdetail.guest.name;
  guestdetail.isLoading = false;
    
  guestdetail.validate = function(guest){
    var errors = [];
    if(!guest.name)
      errors.push("名前を入力してください。");
    else if(!guest.name.match(/^[^\s\w!-~]+ [^\s\w!-~]+$/))
      errors.push("名前が正しくありません。(姓と名の間は半角スペース)");
    if(!guest.head)
      errors.push("頭文字を入力してください。");
    else if(!guest.head.match(/^[ぁ-ん]$/))
      errors.push("頭文字が正しくありません。");
    if(!guest.class)
      errors.push("級を選択してください。");
    if(!guest.belong)
      errors.push("所属を選択してください。");
    
    return errors;
  }  
  
  guestdetail.updateGuest = function(){
    var register = guestdetail.register;
    var guest = guestdetail.guest;
    var promise = null;

    var errors = guestdetail.validate(guest);
    if(errors.length > 0){
      ons.notification.alert(errors.join("<br/>"), {title: "入力の不備"});
      return;
    }

    guestdetail.isLoading = true;
    if(register){
      promise = 
        updateGuest(register, function(guest_obj){
          return guest_obj.set("name", guest.name)
                  .set("head", guest.head)
                  .set("class", guest.class)
                  .set("belong", guest.belong)
                  .update();
        });

      if(guest.name != register){
        replaceName(register, guest.name);
      }
    }
    else{
      var guest_obj = new Guest();
      promise = 
        guest_obj.set("name", guest.name)
          .set("head", guest.head)
          .set("class", guest.class)
          .set("belong", guest.belong)
          .save()
          .then(makeGuestList);
    }
    promise.then(function(){
      ons.notification.alert("登録情報を更新しました。", {title: "情報更新"});
      settingsNavigator.popPage();
    });
  }
  
  guestdetail.confirmDelete = function(){
    ons.notification.confirm(
      "本当に削除してもいいですか？",
      {
        title: "確認",
        callback: function(index){
          if(index == 1)guestdetail.deleteGuest();
        }
      });
  }
  
  guestdetail.deleteGuest = function(){
    $scope.$apply(function(){
      guestdetail.isLoading = true;
    });
    var register = guestdetail.register;
    updateGuest(register, function(guest_obj){
      return guest_obj.delete();
    })
    .then(function(){
      ons.notification.alert("登録情報を削除しました。", {title: "情報削除"});
      settingsNavigator.popPage();
    });
  }
});