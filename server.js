var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var toDoNextId = 1;

// Middleware
app.use(bodyParser.json()); //takes data posted and makes it JSON

//GET /todos get request http /todos
app.get('/todos', function(req, res) {
  var query = req.query;
  var nowBoolean = ('true' == query.completed); //this converts the string 'true' to true and false to 'false'

  var where = {};

  // if the query string contains completed get the string value 'true' or 'false' and convert it to a boolean value
  // add this completed: boolean value to the where object
  if (query.hasOwnProperty('completed')) {
    where.completed = nowBoolean;
  }

  // If there is a q query string and it contains something then add the query string value to the where.description object key
  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%' //$iLike is an option that works with postgres only but is case insensitive, $like is case sensitive in PG
    };
  }

  //  Use the where functionality of sequelize to search db.todo using the where object query parameters
  db.todo.findAll({
    where: where
  }).then(function (todos) {
    res.json(todos);
  }, function(e){
		res.status(500).send();
	});

});

// Get all todos that match the given id parameter
//GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = Number(req.params.id);

  db.todo.findById(todoId).then(function(todo) {
    if (todo) {
      res.status(200).json(todo);
    } else {
      res.status(404).json({
        'Message': 'Todo not found'
      });
    }
  }, function(error) {
    res.status(500).json(error);
  });
});

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

//POST REQUEST /todos - can take data
// needs body-parseer module to send JSON data with post

app.post('/todos', function(req, res) {
  // Gets rid of any other object keys that might get hacked in by hackers
  var body = _.pick(req.body, 'description', 'completed');

  // Takes the databse version of todo and creates a POST on that
  db.todo.create(body).then(function(todo) {
    if (todo) {
      if (todo.description.trim().length === 0) {
        return res.status(400).send();
      } else {
        res.json(todo.toJSON());
      }
    }
  }).catch(function(error) {
    res.status(400).json(e);
  });

});

app.post('/users', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then(function(user){
    res.json(user);
  }, function(e){
    res.status(400).json(e);
  });
});
// DELETE todos/:id

app.delete('/todos/:id', function(req, res) {
  // Get the passed in id from the user to be removed
  var todoId = Number(req.params.id);

  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function(itemsToDelete){
    if (itemsToDelete) {
      res.status(200).json('Your (' + itemsToDelete + ') todo with the id of ' + todoId + ' has been deleted.');
    } else {
      res.status(404).json({
        "error": "Hold on partner, that id does not exist!"
      });
    }
  }, function(e){
    // Sends a server error 500 in case there is trouble connecting to server (rather than crashing).
    res.status(500).send();
  });
});

// UPDATE Todos by ID Using Sequelize

app.put('/todos/:id', function(req, res) {
  var todoId = Number(req.params.id);
  var body = _.pick(req.body, "description", "completed");
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(todoId).then(function(todo){
    if (todo) {
      todo.update(attributes).then(function(todo){
        res.json(todo);
      }, function(e){
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function(e){
    res.status(500).send();
  });
});

app.get('/', function(req, res) {
  res.send('Todo API Root');
});

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log('Express listening on port' + PORT + '!');
  });
});
