var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db); //middleware is a function and we are passing in db right from the start

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var toDoNextId = 1;

// Middleware
app.use(bodyParser.json()); //takes data posted and makes it JSON


app.get('/', function(req, res) {
    res.send('Todo API Root');
});

// COMPONENT TITLE: GET ALL TODOS USING QUERY STRINGS AND PARAMETERS
// COMPONENT DESCRIPTION: Get all todos and optionally use given passed in parameters after the ? to filter results
// REST API: GET /todos?completed=false$q=work

app.get('/todos', middleware.requireAuthentication, function(req, res) {
    var query = req.query;
    var nowBoolean = ('true' == query.completed); //this converts the string 'true' to true and false to 'false'

    var where = {
        userId: req.user.id
    };

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
    }).then(function(todos) {
        res.json(todos);
    }, function(e) {
        res.status(500).send();
    });

});

// COMPONENT TITLE: GET TODOS BY ID
// COMPONENT DESCRIPTION: Get all todos that match the given id parameter
// REST API: GET /todos/:id

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = Number(req.params.id);

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.id
        }
    }).then(function(todo) {
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


// COMPONENT TITLE: POST A NEW TO-DO
// COMPONENT DESCRIPTION: Post a new todo that is associated with a user ID
// REST API: POST /todos
// Note: needs body-parseer module to send JSON data with post (This allow postman to send in data via the REST body)

app.post('/todos', middleware.requireAuthentication, function(req, res) {
    // Gets rid of any other object keys that might get hacked in by hackers
    var body = _.pick(req.body, 'description', 'completed');

    // Takes the databse version of todo and creates a POST on that
    db.todo.create(body).then(function(todo) {

        req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (todo) {
            res.json(todo.toJSON());
        });

    }, function(e) {
        res.status(400).json(e);
    });

});

// COMPONENT TITLE: DELETE TODOS BY ID
// COMPONENT DESCRIPTION: Delete the todo that matches the given id
// REST API: DELETE /todos/:id

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    // Get the passed in id from the user to be removed
    var todoId = Number(req.params.id);

    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.id
        }
    }).then(function(itemsToDelete) {
        if (itemsToDelete) {
            res.status(200).json('Your (' + itemsToDelete + ') todo with the id of ' + todoId + ' has been deleted.');
        } else {
            res.status(404).json({
                "error": "Hold on partner, that id does not exist!"
            });
        }
    }, function(e) {
        // Sends a server error 500 in case there is trouble connecting to server (rather than crashing).
        res.status(500).send();
    });
});

// COMPONENT TITLE: UPDATE TO-DO BY ID
// COMPONENT DESCRIPTION: Update the Todo that matches a given id
// REST API: PUT /todos/:id

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = Number(req.params.id);
    var body = _.pick(req.body, "description", "completed");
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findOne({
        where:{
            id: todoId,
            userId: req.user.id
        }
    }).then(function(todo) {
        if (todo) {
            todo.update(attributes).then(function(todo) {
                res.json(todo);
            }, function(e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    });
});


/////////////// USERS SECTION //////////////

app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });
});

//POST /user/login

app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, "email", "password");

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');
        if (token) { //if token generation went well do beow if not send an error
            res.header('Auth', token).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }

    }, function(e) {
        res.status(401).send();
    });
});

// Setup Sequelize

db.sequelize.sync({
    //force: true
}).then(function() {
    app.listen(PORT, function() {
        console.log('Express listening on port' + PORT + '!');
    });
});
