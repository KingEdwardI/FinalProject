var express = require('express');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var cors = require('cors');
var mongoose = require('mongoose');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

mongoose.connect("mongodb://localhost");

var UserModel = require("./user.model")(mongoose);
var ListItemModel = require("./list.model")(mongoose);

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true}));

app.use(expressSession({
  secret: "g.o.a.t",
  resave: false,
  saveUninitialized: false
}));

app.use(cors({
  credentials: true,
  origin: true
}));

app.use(function(req,res,next) {
  console.log(req.url);
  next();
});

app.post("/login", function(req,res) {
  UserModel.findOne({
    username: req.body.username,
    password: req.body.password
  }, function(err, data) {
      if(err){
        res.status(500);
        res.send("Error logging in");
        return;
      }
      if (!data) {
        res.send({
          status: "error"
        });  
      } else {
        req.session.userId = data._id;
        req.session.save();
        res.send({
          status: "success",
          userInfo: data
        });
      }
  });
});

app.post("/logout", function(req,res){
  req.session.destroy();
  req.session = null;
  res.send({status: "success"});
});

app.post("/signup", function(req, res) {
  UserModel.findOne({
    username: req.body.username
  }, function(err, data) {
    if(err) {
      res.status(500);
      res.send("Error checking username");
      return;
    }
    if(data) {
      res.send({
        status: "error",
        message: "Username already taken"
      });
    } else {
      var userInfo = {
        username: req.body.username,
        password: req.body.password
      };
      var newUser = new UserModel(userInfo);
      newUser.save(function(err, data)  {
        if(err) {
          res.status(500);
          res.send("Error creating user");
          return;
        }
        req.session.userId = data._id;
        req.session.save();
        res.send({
          status: "success",
          userInfo: userInfo
        });
      });
    }
  });
});

app.get('/all', function(req,res) {
  ListItemModel.find(
    { userId: { $ne : req.session.userId } },
    function(err, data) {
      if (err) {
        res.status(500);
        res.send("Error getting all lists");
        return;
      }
      res.send(JSON.stringify(data));
    }
  );
});

app.get('/all_my_lists', function(req,res){
  ListItemModel.find(
    { userId : req.session.userId },
    function(err, data) {
      if (err) {
        res.status(500);
        res.send("Error getting all lists");
        return;
      }
      console.log(data);
      res.send(JSON.stringify(data));
    }
  );
});

app.post('/create', function(req, res) {
  var list = {
    username: req.body.username,
    userId: req.session.userId,
    index: req.body.list.id,
    title: req.body.list.title || "",
    items: []
  };


  new ListItemModel(list).save(function(err, data) {
    if (err) {
      res.status(500);
      res.send("Error creating line item");
      return;
    }
    res.send(JSON.stringify(data));
  });
});

app.get('/saved', function(req,res) {
  UserModel.findOne( 
    { _id: req.session.userId },
    function(err, data){
      if (err) {
        res.status(500);
        res.send("Error getting saved lists");
        return;
      }
      res.send(JSON.stringify(data));
    });
});


app.post('/saved', function(req,res) {
   ListItemModel.findOne(
    { _id: req.body._id },
    function(err, data) {
      if (err) {
        res.status(500);
        res.send("Error getting saved lists");
        return;
      }
      var listData = data.items;
      UserModel.findOneAndUpdate(
        { _id: req.session.userId },
        { $addToSet: { savedList : { $each : listData } } },
        { new : true },
        function(err,data){
          if(err){
            console.log(err);
            return;
          }
          console.log(data);
          res.send(JSON.stringify(data));
        });
    });
});

app.post('/update', function(req, res) {
  var id = req.body.id;
  ListItemModel.findOneAndUpdate(
    { _id : id},
      {$push: {items: req.body.item}},
    {new : true},
    function(err, data) {
      if (err) {
          res.status(500);
          res.send("Error creating list item");
          return;
      }
      res.send(data);
    }
  );
});

app.post("/delete_list", function(req, res) {
  ListItemModel.remove(
    { _id : req.body.id },
    function(err){
      if (err) {
        res.status(500);
        res.send("Error deleting list items");
        return;
      }
      ListItemModel.find(
        { userId : req.session.userId },
        function(err, data) {
          if(err) {
            res.status(500);
            res.send("Error getting all Lists");
            return;
          }
          res.send(JSON.stringify(data));
        });
    });
});

app.get('/artist_array', function(req, res) {
  res.sendFile(__dirname+"/artist2.txt");
});

app.use(function(req, res, next) {
  res.status(404);
  res.send("no");
});

app.listen(3500, function(){
  console.log("yes: 3500");
});
