// Need a .keep in the data folder go git will push it - wont push an empty folder
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

// Model
var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false, //for required fields
        validate: {
            len: [1, 250] //sequalize key and value for validate object that makes sure the string is btw 1 and 350 char
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false, //for required fields
        defaultValue: false
    }
});

var User = sequelize.define('user', {
    email: Sequelize.STRING
});

// Set associations in sequelize
Todo.belongsTo(User);
User.hasMany(Todo);

// Sync (Set up sequelize)
sequelize.sync({
    //force: true //force true empties the database each time you run the program default is false
}).then(function() {
    console.log('Database is synced');

    // User.create({
    //     email: 'andrew@example.com'
    // }).then(function() {
    //     return Todo.create({
    //         description: 'clean the yard'
    //     });
    // }).then(function(todo) {
    //     User.findById(1).then(function(user) {
    //         user.addTodo(todo);
    //     }, function() {
    //
    //     });
    // });

    User.findById(1).then(function(user) {
        user.getTodos({where: {completed: true}}).then(function(todos) {
            todos.forEach(function(todo) {
				console.log(todo.toJSON());
            });
        });
    });


    // Todo.findById(2).then(function(todo){
    // 	if (todo){
    // 		console.log(todo.toJSON());
    // 	} else {
    // 		console.log('Todo not found');
    // 	}
    // });


});






// Todo.create({
// 	description: 'Take out trash',
// 	//completed: false //this is now handled by the default value term above
// }).then(function(todo){
// 	return Todo.create({
// 		description: 'Clean Office'
// 	});
// 	console.log('finished');
// 	console.log(todo);
// }).then(function (){
// 		return Todo.findById(1);
//
// }).then(function(todo){
// 		if (todo) {
// 			console.log(todo.toJSON());
//
// 		} else {
// 			console.log('no todo found');
// 		}
// }).catch(function (e) {
// 	console.log(e);
// });
