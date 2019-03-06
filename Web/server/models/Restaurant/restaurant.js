/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Restaurant', {
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
    ville: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    codepostal: {
      type: DataTypes.STRING(7),
      allowNull: false
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
    Organisation_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Organisation',
        key: 'id'
      }
    }
  }, {
    tableName: 'Restaurant'
  });
};
