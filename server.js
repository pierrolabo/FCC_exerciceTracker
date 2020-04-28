const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');

const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://miguel:Azerty44@cluster0-dxc9v.mongodb.net/test?retryWrites=true&w=majority'
);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

//  Database
let userSchema = new mongoose.Schema({
  name: String,
});

let exerciseSchema = new mongoose.Schema({
  userId: Number,
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now },
});
let User = mongoose.model('user', userSchema);
let Exercice = mongoose.model('exercice', exerciseSchema);

//  Routes
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Create USER
app.post('/api/exercise/new-user', function (req, res) {
  let userName = req.body.username;
  console.log(userName);
  if (userName !== null) {
    let newUser = new User({ name: userName });
    newUser.save(function (err, result) {
      if (err) console.log(err);
      const [username, _id] = [result.name, result._id];
      res.json({ username: username, _id: _id });
    });
  }
});

//  Get All Users
app.get('/api/exercise/users', function (req, res) {
  User.find(function (err, result) {
    if (err) res.json({ error: err });
    res.json({ users: result });
  });
});

//  Exercice
app.post('/api/exercise/add', function (req, res) {
  const exercice = {
    userId: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
  };
  if (isValidDate(req.body.date)) {
    exercice.date = new Date(req.body.date);
  }

  let newExercice = new Exercice(exercice);
  newExercice.save(function (err, result) {
    if (err) res.json({ error: err });
    res.json({ success: 'ok', result: result });
  });
});

//Check if the date is valid
const isValidDate = (str) => {
  let date = new Date(str);
  return date.toString() !== 'Invalid Date';
};
const listener = app.listen(3000, () => {
  console.log('Listening on port: ', 3000);
});
