const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const url = require('url');
const querystring = require('querystring');
const cors = require('cors');
const autoIncrement = require('mongoose-auto-increment');

const mongoose = require('mongoose');

var connection = mongoose.createConnection(
  'mongodb+srv://miguel:Azerty44@cluster0-dxc9v.mongodb.net/test?retryWrites=true&w=majority'
);
autoIncrement.initialize(connection);
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

//  Database
let userSchema = new mongoose.Schema({
  id: { type: Number, ref: 'id' },
  username: String,
});

let exerciseSchema = new mongoose.Schema({
  userId: Number,
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now },
});

userSchema.plugin(autoIncrement.plugin, 'user');
let User = connection.model('user', userSchema);
//let User = mongoose.model('user', userSchema);
let Exercice = connection.model('exercice', exerciseSchema);

//  Routes
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Create USER
app.post('/api/exercise/new-user', function (req, res) {
  let userName = req.body.username;
  console.log(userName);
  if (userName !== null) {
    let newUser = new User({ username: userName });
    newUser.save(function (err, result) {
      if (err) console.log(err);
      const [username, _id] = [result.username, result._id];
      res.json({ username: username, _id: _id });
    });
  }
});

//  Get All Users
app.get('/api/exercise/users', function (req, res) {
  User.find(function (err, result) {
    if (err) res.json({ error: err });
    res.json([...result]);
  });
});

//  Add Exercice
app.post('/api/exercise/add', function (req, res) {
  const exercice = {
    userId: parseInt(req.body.userId),
    description: req.body.description,
    duration: req.body.duration,
  };
  if (isValidDate(req.body.date)) {
    exercice.date = new Date(req.body.date);
  }

  let newExercice = new Exercice(exercice);

  newExercice.save().then((exercice) => {
    User.findById(exercice.userId, function (err, result) {
      if (err) res.json({ error: err });
      res.json({
        username: result.username,
        description: exercice.description,
        duration: exercice.duration,
        _id: exercice.userId,
        date: parseDate(exercice.date),
      });
    });
  });
});
//ByaoDPhBg
//https://fuschia-custard.glitch.me/api/exercise/log?userId=BJaDFbkrB?from=2020-05-02
//  Get exercices from User
app.get('/api/exercise/log', function (req, res) {
  let userLog = [];
  let query = req.query;
  let userId = query.userId;
  let from = query.from;
  let to = query.to;
  let limit = query.limit;
  console.log('query', query);
  if (query.userId !== undefined) {
    User.findById(query.userId, function (err, result) {
      if (err) console.log(err);
      return result;
    }).then((user) => {
      Exercice.find({ userId: query.userId }, function (err, result) {
        if (err) console.log(err);
        userLog = filterLog([...result], from, to, limit);
        console.log(userLog);
        let obj = {};
        obj = { ...user._doc };
        obj.log = userLog;
        obj.count = result.length;
        res.json({ ...obj });
      });
    });
  } else {
    res.json({ error: 'no userId' });
  }
});
//Check if the date is valid
const isValidDate = (str) => {
  let date = new Date(str);
  return date.toString() !== 'Invalid Date';
};
const parseDate = (date) => {
  return date.toDateString();
};
const filterLog = (arr, from, to, limit) => {
  let log = arr;
  //Filtering on date
  if (from !== undefined && to !== undefined) {
    log = log.filter(
      (exo) => exo.date >= new Date(from) && exo.date <= new Date(to)
    );
    console.log('both exist');
  } else if (from !== undefined) {
    log = log.filter((exo) => exo.date >= new Date(from));
    console.log('exist');
  } else if (to !== undefined) {
    log = log.filter((exo) => exo.date <= new Date(to));

    console.log('to exist');
  }
  //Filtering on quantity
  if (limit !== undefined) {
    return log.slice(0, limit);
  } else {
    return log;
  }
};
const listener = app.listen(3000, () => {
  console.log('Listening on port: ', 3000);
});
