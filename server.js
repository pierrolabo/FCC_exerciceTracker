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

let User = mongoose.model('user', userSchema);

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
  User.find(function (req, result) {
    res.json({ users: result });
  });
});
const listener = app.listen(3000, () => {
  console.log('Listening on port: ', 3000);
});
