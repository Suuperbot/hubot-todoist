// Description:
//  Todoist Helpful Bot
// Commands:
//
// Author:
//   Nobuhiro Kasai

var https = require('https');
var querystring = require('querystring');
var async = require('async');

const baseoption = {
  hostname: 'todoist.com',
  path: '/API/v7/sync',
  method: 'POST',
  headers : {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};
const basedata = {
  'token' : process.env.TODOIST_TOKEN,
  'sync_token': "*",
};

function requestTask(msg) {
  msg.send("タスクを取得しています......");
  var projectdata = basedata;
  projectdata["resource_types"] = '["projects","items","collaborators"]';
  var urloption = baseoption;
  urloption["headers"]["Content-Length"] = querystring.stringify(projectdata).length;
  var datas = "";
  var req = https.request(urloption,function(res) {
    res.on('data',function(data){
      datas += data;
    });
    res.on('end',function() {
      showTask(msg,JSON.parse(datas.toString()));
    });
  });
  req.write(querystring.stringify(projectdata));
  req.end();
}

function showTask(msg,data) {
  async.filter(data.projects,
    function(item,callback) {
      if(item.name === process.env.TODOIST_PROJECT) {
        callback(item.id);
      }
    },
    function(id){
      data.items.filter(function(item,index) {
        if(item.project_id == id){
          text = item["date_string"] + " : " + item["content"];
          msg.send(text);
        }
      });
    }
  );
}

module.exports = function(robot) {
  robot.respond(/todo show/i, function(msg){
    requestTask(msg);
  });
};
