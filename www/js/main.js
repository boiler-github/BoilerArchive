module.controller('mainController', function($scope, $timeout){
  var main = this;
  main.isLoading = true;
  $timeout(function(){
    main.isLoading = false;
  }, 2000);
  
  main.contest_list = contest_list;
  main.admin = (login_admin == 'true');

  main.resetPage = function(){
    var index = tabbar.getActiveTabIndex();
    if(index == 3)return;
    
    var page = "html/";
    if(index == 0){
      main.contest_list = contest_list;
      page += "record.html";
      editNavigator.resetToPage(page, {animation: "fade"});
    }
    
    if(index == 1){
      page += "view.html";
      viewNavigator.resetToPage(page, {animation: "fade"});
    }
    
    if(index == 2){
      main.admin = (login_admin == 'true');
      page += "settings.html";
      settingsNavigator.resetToPage(page, {animation: "fade"});
    }
  }
});