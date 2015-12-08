module.exports = function(sequelize, DataTypes){
  return  sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, //makes sure there is no other users in the sdatabse with the same name
      validate: {
        isEmail: true //does teh email validation for us
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmpty: false,
      validate: {
        len: [7, 100],
        notEmpty: true
      }
    }
  }, {
    hooks: {
      beforeValidate: function(user, options){
        if (typeof user.email === 'string'){
          user.email = user.email.toLowerCase();
        }
      }
    }
  });
};
