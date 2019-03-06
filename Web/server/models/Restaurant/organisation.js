/* jshint indent: 2 */
const _ = require('lodash');
const bcrypt = require('bcryptjs');

function hashPassword (entity) {
  return new Promise((resolve, reject) => {
      if(entity.changed('password')) {
        bcrypt.genSalt(7, (err, salt) => {
          bcrypt.hash(entity.password, salt, (err, hash) => {
              entity.password = hash;
            return resolve(entity);
          });
        });
      } else return resolve(entity);
    });
}

module.exports = function(sequelize, DataTypes) {
    var Organisation = sequelize.define('Organisation', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: DataTypes.STRING(45),
        allowNull: false
      },
      username: {
        type: DataTypes.STRING(45),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      courriel: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
          isEmail: true
        }
      }
    }, {
      tableName: 'Organisation',
      hooks: {
        beforeCreate: hashPassword,
        beforeUpdate: hashPassword
      }
    });

    Organisation.prototype.toJSON = function() {
        var organisation = this;
        return _.pick(organisation, ['id', 'nom', 'username', 'courriel']);
    }

    return Organisation;
  };
  