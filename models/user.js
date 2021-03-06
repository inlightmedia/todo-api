var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, //makes sure there is no other users in the sdatabse with the same name
            validate: {
                isEmail: true //does teh email validation for us
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL, //virutal passwords are not storse on database
            allowNull: false,
            isEmpty: false,
            validate: {
                len: [7, 100],
                notEmpty: true
            },
            set: function(value) {
                var salt = bcrypt.genSaltSync(10); //10 is the number of chars in the salt or "randomization code"
                var hashedPassword = bcrypt.hashSync(value, salt); //value is te password
                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase().trim();
                }
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (typeof body.email !== 'string' && typeof body.password !== 'string') {
                        reject();
                    }

                    user.findOne({
                        where: {
                            email: body.email
                        }
                    }).then(function(user) {
                        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) { //get is a part of sequelize and it returns a value when passed a key (it takes a string) - bcrypt.compareSync compared the password you are passing in the the password of the email that was passed in that is already in the database and is salted and hashed
                            return reject();
                        }
                        resolve(user);
                    }, function(e) {
                        reject();
                    });
                });
            },
            findByToken: function (token) {
                return new Promise(function(resolve, reject) {
                    try {
                        var decodedJWT = jwt.verify(token, 'qwerty098'); //jwt.verify makes sure the token is valid and has not been modified
                        var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#!');
                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8)); //change to JSON

                        user.findById(tokenData.id).then(function (user) {
                            if (user) {
                                resolve(user);
                            } else {
                                reject();
                            }
                        }, function (error) {
                            reject();
                        });
                    } catch (e) {
                        reject();
                    }
                });
            }
        },
        instanceMethods: { //hides the password and other sensitive database columns
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, "id", "email", "updatedAt", "createdAt");
            },
            generateToken: function(type) {
                if (!_.isString(type)){
                    return undefined;
                }

                try {
                    var stringData = JSON.stringify({id: this.get('id'), type: type});
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString();
                    var token = jwt.sign({
                        token: encryptedData
                    }, 'qwerty098'); //sign takes an object.token and a string password

                    return token;
                } catch (e) {
                    console.error(e);
                    return 'my_string';
                }
            }
        }
    });

    return user;
};
