var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
// var querystring = require('querystring');

var app = express();
var PORT = process.env.PORT || 3000;


var todos = [];
var toDoNextId = 1;

// Middleware
app.use(bodyParser.json()); //takes data posted and makes it JSON

//GET /todos get request http /todos
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;
	//console.log(queryParams);
	var nowBoolean = ('true' == req.query.completed); //this converts the string 'true' to true and false to 'false'


	if (req.query.hasOwnProperty('completed')) {
		// Makes the the query has the 'completed' property and that it is set to the string true
		// If this is the case it will set the variable filteredTodos to equal all the todos that have {completed: true}
		filteredTodos = _.where(filteredTodos, {
			completed: nowBoolean
		});
	}

	// if(req.query.hasOwnProperty('completed') && req.query.completed === 'false') {
	// 	// Same as above but with 'false'
	// 	filteredTodos = _.where(filteredTodos, {completed: false});
	// }

	if (req.query.hasOwnProperty('q') && req.query.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(object) {
			return object.description.toLowerCase().indexOf(req.query.q.toLowerCase()) > -1; //indexOf only works with strings and returns a -1 if the string passed in is not in the string being parsed
		});
	}

	res.json(filteredTodos);

});


//GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = Number(req.params.id);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
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
	db.todo.create(body).then(function (todo){
		if (todo) {
			if (todo.description.trim().length === 0) {
				return res.status(400).send();
			}
			// Trims off preceeding and trailing spaces in user generated description
			todo.description = todo.description.trim();

			// Add this new filtered/picked code to the todos array
			todos.push(todo);

			// Creates the id property and gives it a value
			todo.id = toDoNextId;

			// Increase the value of id by 1 so that the next todo will have a different id
			toDoNextId += 1;

			// Send the new object as a POST
			res.json(todo.toJSON());
		}
	}).catch(function (error) {
			res.status(400).json(e);
	});


	// OLD NON PERSISTENT DATABASE POST THAT REQUIED POSTMAN

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send();
	// }
	// // Trims off preceeding and trailing spaces in user generated description
	// body.description = body.description.trim();
	//
	// // Gets rid of any other object keys that might get hacked in by hackers
	// var pickedBody = _.pick(body, "description", "completed");
	//
	// // Add this new filtered/picked code to the todos array
	// todos.push(pickedBody);
	//
	//
	// // Creates the id property and gives it a value
	// pickedBody.id = toDoNextId;
	//
	// // Increase the value of id by 1 so that the next todo will have a different id
	// toDoNextId += 1;
	//
	// // Send the new object as a POST
	// res.json(body);
});

// DELETE todos/:id

app.delete('/todos/:id', function(req, res) {
	// Get the passed in id from the user to be removed
	var todoId = Number(req.params.id);
	console.log('we are in delete');
	// Get the object with the id passed in and assign it to matchedTodo
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	} else {
		res.status(404).json({
			"error": "Hold on partner, that id does not exist!"
		});
	}
	// without() takes an array and the subsequent arguments is the things to be removed



	// Send back the new array with the matched object removed

});

app.put('/todos/:id', function(req, res) {
	var todoId = Number(req.params.id);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	var body = _.pick(req.body, "description", "completed");
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).json({
			"error": "Sorry, that todo item is just not there!"
		});
	}

	// object.hasOwnProperty(exampleProperty) returns a true of false - lets us know if the object has the property

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		//never provided attribute
		return res.status(400).send();
	} else

	// Validates description
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;

		// If not string or 0 long
	} else if (body.hasOwnProperty('description')) {

		return res.status(400).json({
			"error": "Your todo is not valid."
		});
	}

	matchedTodo = _.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);

});

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

db.sequelize.sync().then(function () {
	app.listen(PORT, function () {
		console.log('Express listening on port' + PORT + '!');
	});
});
