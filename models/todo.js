//must havae a format when called by sequelize

module.exports = function (sequelize, DataTypes){
  //return the nwe model that will be  auto added to sequelize
  return sequelize.define('todo', {
  	description: {
  		type: DataTypes.STRING,
  		allowNull: false, //for required fields
  		validate: {
  				len: [1,250] //sequalize key and value for validate object that makes sure the string is btw 1 and 350 char
  		}
  	},
  	completed: {
  		type: DataTypes.BOOLEAN,
  		allowNull: false, //for required fields
  		defaultValue: false
  	}
  }, {
    hooks: { // hooks run some code on the object before or after an event such as Create or Validate
      beforeCreate: function(todo, options){
        if (typeof todo.description === 'string'){
          todo.description = todo.description.trim();
        }
      }
    }
  });
};
