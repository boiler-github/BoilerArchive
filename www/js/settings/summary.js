module.controller('summaryController', function($scope, $timeout){
  var summary = this;
  var smr = [
    {title: "正規試合数", limit: 20, values: []},
    {title: "勝数",       limit: 20, values: []},
		{title: "勝率",       limit: 20, values: []},
		{title: "枚数差合計", limit: 15, values: []},
		{title: "枚数差平均", limit: 15, values: []},
		{title: "金星獲得数", limit: 10, values: []},
		{title: "金星献上数", limit: 10, values: []},
		{title: "運命戦数",   limit: 10, values: []},
		{title: "運命戦勝数", limit: 10, values: []},
		{title: "連勝数",     limit: 15, values: []},
//		{title: "指導数",     limit: 7, values: []},
//		{title: "被指導数",   limit: 7, values: []},
		{title: "一人取り数", limit: 10, values: []},
  	{title: "読唱数",     limit: 10, values: []},
  ];
  
  summary.summaries = [];
  summary.isLoading = true;
  summary.address = "boiler.archive@gmail.com";
  if(login_address)summary.address = login_address;

  var regular = [];
  type_list.forEach(function(type){
    if(type.isRegular){
      regular.push(type.name);
    }
  });

  //11(13): 読唱数
  var sum_songer = 0;
  songer_list.forEach(function(songer){
    if(songer.id <= 7)sum_songer += songer.count;
    else smr[11].values.push({name: songer.name, value: songer.count});
  });
  smr[11].values.push({name: songer_list[0].name, value: sum_songer});
  
  async.each(member_list, function(member, resolve){
    var name = member.name;
    var all = [
      Record.equalTo("winner", name),
      Record.equalTo("loser", name),
    ];
    
    var ps = [];

    //0: 正規試合数
    var total;
    
    var p0 = 
      Record.or(all)
        .greaterThanOrEqualTo("date", semester)
        .in("type", regular)
        .count()
        .fetchAll()
        .then(function(results){
          total = results.count;
          smr[0].values.push({name: name, value: total});
        });

    //1: 勝数
    var win;
    
    var p1 = 
      Record.equalTo("winner", name)
        .greaterThanOrEqualTo("date", semester)
        .in("type", regular)
        .count()
        .fetchAll()
        .then(function(results){
          win = results.count;
          smr[1].values.push({name: name, value: win});
        });    
    
    //2: 勝率
    ps.push(
      Promise.all([p0, p1])
        .then(function(){
          smr[2].values.push({name: name, value: (total >= 20 ? win / total : 0)});
        })
    );
    
    //3: 枚数差合計
    //4: 枚数差平均
    var sum_diff = 0;
    var wgame = [];
    var lgame = [];
    
    var p3a =
      Record.equalTo("winner", name)
      .greaterThanOrEqualTo("date", semester)
      .in("type", regular)
      .order("date", false)
      .fetchAll()
      .then(function(results){
        results.forEach(function(result){
          sum_diff += result.diff;
          wgame.push(result.date + "-" + result.round);
        });
      });

    var p3b = 
      Record.equalTo("loser", name)
      .greaterThanOrEqualTo("date", semester)
      .in("type", regular)
      .order("date", false)
      .fetchAll()
      .then(function(results){
        results.forEach(function(result){
          sum_diff -= result.diff;
          lgame.push(result.date + "-" + result.round);
        });
      });
    
    var p3c =
      Record.equalTo("winner", name)
      .greaterThanOrEqualTo("date", semester)
      .in("type", regular)
      .order("date", false)
      .skip(100)
      .fetchAll()
      .then(function(results){
        results.forEach(function(result){
          sum_diff += result.diff;
          wgame.push(result.date + "-" + result.round);
        });
      });

    var p3d = 
      Record.equalTo("loser", name)
      .greaterThanOrEqualTo("date", semester)
      .in("type", regular)
      .order("date", false)
      .skip(100)
      .fetchAll()
      .then(function(results){
        results.forEach(function(result){
          sum_diff -= result.diff;
          lgame.push(result.date + "-" + result.round);
        });
      });

    ps.push(
      Promise.all([p3a, p3b, p3c, p3d])
        .then(function(){
          smr[3].values.push({name: name, value: (total >= 20 ? sum_diff : 0)});
          smr[4].values.push({name: name, value: (total >= 20 ? sum_diff / total : 0)})
          
          //9: 連勝数
          wgame.sort();
          lgame.sort();

          var wpos = 0;
          var mcombo = 0;
          for(var lpos = 0; lpos < lgame.length; lpos++){
            var start = wpos;
            while(wpos < wgame.length && wgame[wpos] < lgame[lpos])wpos++;
            if(wpos - start > mcombo)mcombo = wpos - start;
          }
          if(wgame.length - wpos > mcombo)mcombo = wgame.length - wpos;
          smr[9].values.push({name: name, value: mcombo});
        })
    );
    
    //5: 金星獲得数
    ps.push(
      Record.equalTo("winner", name)
        .greaterThanOrEqualTo("date", semester)
        .in("type", regular)
        .equalTo("compareClass", -1)
        .count()
        .fetchAll()
        .then(function(results){
          smr[5].values.push({name: name, value: results.count});
        })
    );

    //6: 金星献上数
    ps.push(
      Record.equalTo("loser", name)
        .greaterThanOrEqualTo("date", semester)
        .in("type", regular)
        .equalTo("compareClass", -1)
        .count()
        .fetchAll()
        .then(function(results){
          smr[6].values.push({name: name, value: results.count});
        })
    );
    
    //7: 運命戦数
    ps.push(
      Record.or(all)
        .greaterThanOrEqualTo("date", semester)
        .in("type", regular)
        .equalTo("diff", 1)
        .count()
        .fetchAll()
        .then(function(results){
          smr[7].values.push({name: name, value: results.count});
        })
    );
    
    //8: 運命戦勝数
    ps.push(
      Record.equalTo("winner", name)
        .greaterThanOrEqualTo("date", semester)
        .in("type", regular)
        .equalTo("diff", 1)
        .count()
        .fetchAll()
        .then(function(results){
          smr[8].values.push({name: name, value: results.count});
        })
    );
        
    //10,11: 指導戦　省略
    
    //10(12): 一人取り数
    ps.push(
      Record.equalTo("winner", name)
        .equalTo("type", SINGLE)
        .count()
        .fetchAll()
        .then(function(results){
          smr[10].values.push({name: name, value: results.count});
        })
    );
    
    Promise.all(ps)
      .then(function(){
        resolve();
      });
  }, function(){
    smr.forEach(function(data){
      summary.makeRanking(data);
    });
    
    //総試合
    var total_count;
    var p1 =
      Record.greaterThanOrEqualTo("date", semester)
        .count()
        .fetchAll()
        .then(function(results){
          total_count = results.count;
        });
    
    //正規試合
    var regular_count;
    var p2 = 
      Record.greaterThanOrEqualTo("date", semester)
        .in("type", regular)
        .count()
        .fetchAll()
        .then(function(results){
          regular_count = results.count;
        });
        
    //運命戦
    var last1_count;
    var p3 = 
      Record.greaterThanOrEqualTo("date", semester)
        .equalTo("diff", 1)
        .count()
        .fetchAll()
        .then(function(results){
          last1_count = results.count;
        });
    
    //金星
    var rev_count;
    var p4 = 
      Record.greaterThanOrEqualTo("date", semester)
        .equalTo("compareClass", -1)
        .count()
        .fetchAll()
        .then(function(results){
          rev_count = results.count;
        });
    
    Promise.all([p1, p2, p3, p4])
      .then(function(){
        //csv作成
        var csv_data = [];
        for(var i = 0; i < 50; i++)csv_data.push([]);
        summary.summaries.forEach(function(smr){
          csv_data[0].push(smr.title + ", , ");
          var prev = -1;
          var rank = 0;
          smr.values.forEach(function(data, key){
            var value = data.value;
            if(Math.round(value) !== value)value = value.toFixed(3);
            if(value != prev){
              prev = value;
              rank = key + 1;
            }
            csv_data[key + 1].push(rank + ", " + data.name + ", " + value);
          });
          for(var i = smr.values.length + 1; i < 30; i++)csv_data[i].push(" , , ");
        });
        
        csv_data[0].push("集計開始日" + ", " + semester);
        csv_data[1].push("全試合総数" + ", " + total_count);
        csv_data[2].push("正規試合総数" + ", " + regular_count);
        csv_data[3].push("運命戦総数" + ", " + last1_count);
        csv_data[4].push("金星総数" + ", " + rev_count);
                
        var csv_str = [];
        csv_data.forEach(function(row){
          csv_str.push(row.join(", , "));
        });

        var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        var dataObj = new Blob([bom, csv_str.join("\n")], { type: 'text/plain' });
        ncmb.File.upload("summary.csv", dataObj)
          .then(function(){
            $scope.$apply(function(){
              summary.isLoading = false;
              sendMail(summary.address, "boiler.archive@gmail.com", "集計ファイル出力", ["集計ファイルを出力しました。以下のURLから確認できます。", "", "https://mb.api.cloud.nifty.com/2013-09-01/applications/y4VJ2pWPiaqrfHyZ/publicFiles/summary.csv"]);
            });
          });
      });
  });

  summary.makeRanking = function(data){
    var sorted = data.values.sort(function(elemA, elemB){
      return (elemA.value > elemB.value ? -1 : 1);
    });
    
    sorted.forEach(function(element){
      element.show = true;
    });

    var lim = data.limit;
    while(sorted[lim - 1].value == sorted[lim].value) lim++;
    $scope.$apply(function(){
      summary.summaries.push({
        title: data.title,
        values: sorted.slice(0, lim),
      });
    });
  }
});
