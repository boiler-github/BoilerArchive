module.controller('semesterController', function($scope, $timeout){
  var semester = this;
  semester.doUpdate = false;
  semester.notUpdated = [];
  semester.isLoading = false;

  semester.proceed = function(){
    if(!semester.next){
      ons.notification.alert("次学期開始日が入力されていません。", {title: "入力の不備"});
    }
    else{
      semester.isLoading = true;
      var ps = [];
      if(semester.doUpdate)ps.push(semester.update());
      ps.push(
        Config.equalTo("name", "semester")
          .fetch()
          .then(function(obj){
            obj.set("value", semester.next)
              .update();
          })
      );
      
      ps.push(
        Songer.fetchAll()
          .then(function(songers){
            songers.forEach(function(songer){
              songer.set("count", parseInt(0))
                .update();
            });
          })
      );

      Promise.all(ps)
        .then(function(){
          settingsNavigator.pushPage('semester_submit.html', {data: semester.notUpdated});
        });
    }
  }
  
  semester.update = function(){
    return Member.fetchAll()
      .then(function(results){
        results.forEach(function(member){
          var grade = member.grade;
          var updated = member.updated;
          if(grade >= "1" && grade <= "3"){
            grade = (parseInt(grade) + 1).toString();
          }else{
            semester.notUpdated.push({
              name: member.name,
              grade: member.grade,
            });
            updated = false;
          }
          member.set("grade", grade)
            .set("updated", updated)
            .update();
        });
      });
  }
});

module.controller('semestersubmitController', function(){
  var semestersubmit = this;
  semestersubmit.notUpdated = settingsNavigator.topPage.data;

  semestersubmit.showGrade = showGrade;
});