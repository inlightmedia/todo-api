var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'Meet Mom for lunch',
	completed: false
},
{
	id: 2,
	description: 'Go to the market',
	completed: false 
},
{
    id: 3,
	description: 'Go to the mailbox',
	completed: true
}];

//GET /todos get request http /todos
//GET /todos/:id

app.get('/todos', function (req, res){
	res.json(todos);
});

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
   //res.json(todos[todo]);
   //res.send('Asking for todo wi id: ' + req.params.id);
});

app.get('/', function (req, res){
	res.send('Todo API Root');
});

app.listen(PORT, function () {
	console.log('Express listening on port' + PORT + '!');
})