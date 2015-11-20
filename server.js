var express = require('express');
var bodyParser = require('body-parser');
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
   var matchFound;

   todos.forEach(function (todo){
   		
   		if (todo.id === todoId){
   			matchFound = todo;   			
   		}   		
   });

   if (matchFound) {   		
   		res.json(matchFound);
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
	todos.push(body);	

	body.id = toDoNextId; 
	toDoNextId += 1;
	//toDoNextId +=1;
	console.log(toDoNextId + 'is the next ID');
	console.log('description: ' + body.description);
	res.json(body);
});

app.listen(PORT, function () {
	console.log('Express listening on port' + PORT + '!');
});


