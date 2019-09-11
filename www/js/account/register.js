module.controller('accountController', function($scope, $timeout){
  var account = this;
  account.kana = kana;
  account.player_list = player_list;
  account.player = login_player;
  account.address = login_address;
  account.admin = (login_admin == 'true');
  
  account.identify = function(){
    if(account.admin){
      ons.notification.prompt("管理者用パスワードを入力してください。",
        {
          title: "パスワード入力",
          callback: function(password){
            if(password != admin_pass){
              ons.notification.alert("パスワードが違います。", {title: "認証失敗"});
              $scope.$apply(function(){
                account.admin = false;
              });
            }
          }
        });
    }
  }
  
  account.save = function(){
    localStorage.setItem('player', account.player);
    localStorage.setItem('address', account.address);
    localStorage.setItem('admin', account.admin);
    login_player = account.player;
    login_address = account.address;
    login_admin = (account.admin ? 'true' : 'false');
    ons.notification.alert("変更を保存しました。", {title: "情報登録"});
  }
});
