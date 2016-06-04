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
  projectdata["resource_types"] = '["projects","items"]';
  var urloption = baseoption;
  urloption["headers"]["Content-Length"] = querystring.stringify(projectdata).length;
  var datas = "";
  var req = https.request(urloption,(res) => {
    res.on('data',(data) => {
      datas += data;
    });
    res.on('end',() => {
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
      data.items.filter((item,index) => {
        if(item.project_id == id){
          text = item["date_string"] + " : " + item["content"];
          msg.send(text);
        }
      });
    }
  );

  //msg.send(JSON.stringify(projcet));
  //msg.send(project_id);
  /*
  var items = data["items"].filter((item,index)  => {
    if(item.projcet_id == project_id) return true;
  });
  */
  // msg.send(JSON.stringify(items));
}

module.exports = function(robot) {
  robot.respond(/todo show/i, function(msg){
    requestTask(msg);
  });
};
