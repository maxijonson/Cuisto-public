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
      }else return resolve(entity);
    });
}
module.exports = function(sequelize, DataTypes) {
  var Employe = sequelize.define('Employe', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        is: /(?:(?![×Þß÷þø])[a-zÀ-ÿ\s\-\'])+$/g
      }
    },
    prenom: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        is: /(?:(?![×Þß÷þø])[a-zÀ-ÿ\s\-\'])+$/g
      }
    },
    telephone: {
      type: DataTypes.STRING(14),
      allowNull: false,
      validate: {
        is: /^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/g
      }
    },
    courriel: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    tauxHoraire: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    Restaurant_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Restaurant',
        key: 'id'
      }
    },
    Poste_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Poste',
        key: 'id'
      }
    }
  }, {
    tableName: 'Employe',
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword
    }
  });

  Employe.prototype.toJSON = function() {
    var employe = this;
    return _.pick(employe, ['id', 'nom', 'prenom', 'telephone', 'courriel', 'tauxHoraire', 'username', 'admin', 'Restaurant', 'Poste']);
  }
  return Employe;
};
