var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;


var todos = [];
var toDoNextId = 1;

// Middleware
app.use(bodyParser.json()); //takes data posted and makes it JSON

//GET /todos get request http /todos
app.get('/todos', function (req, res){
	res.json(todos);
});

//GET /todos/:id
app.get('/todos/:id', function (req, res){
   var todoId = Number(req.params.id);      
   var matchedTodo = _.findWhere(todos, {id: todoId});

   if (matchedTodo) {   		
   		res.json(matchedTodo);
   	} else {
   		res.status(404).send();
   }  
});

app.get('/', function (req, res){
	res.send('Todo API Root');
});

//POST REQUSET /todos - can take data
// needs body-parseer module to send JSON data with post
app.post('/todos', function (req, res) {
	var body = req.body;
	
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	// Trims off preceeding and trailing spaces in user generated description
	body.description = body.description.trim();

	// Gets rid of any other object keys that might get hacked in by hackers
	var pickedBody = _.pick(body, "description", "completed");
	
	// Add this new filtered/picked code to the todos array
	todos.push(pickedBody);	

	
	// Creates the id property and gives it a value
	pickedBody.id = toDoNextId; 
	
	// Increase the value of id by 1 so that the next todo will have a different id
	toDoNextId += 1;

	// Send the new object as a POST
	res.json(body);
});

// DELETE todos/:id

app.delete('/todos/:id', function (req, res) {
    // Get the passed in id from the user to be removed
    var todoId = Number(req.params.id);      
    console.log('we are in delete');
    // Get the object with the id passed in and assign it to matchedTodo
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {   		
   		todos = _.without(todos, matchedTodo);   		
   		res.json(matchedTodo);
   		console.log('Yippee Found');
   		res.status(200).send();
   	} else {
   		res.status(404).json({"error": "failed"});
   		console.log('Hold on partner, that id does not exist!');
    }
	// without() takes an array and the subsequent arguments is the things to be removed
	
	

	// Send back the new array with the matched object removed
	
});

app.listen(PORT, function () {
	console.log('Express listening on port' + PORT + '!');
});


