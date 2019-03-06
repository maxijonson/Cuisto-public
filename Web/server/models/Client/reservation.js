/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Reservation', {
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
    telephone: {
      type: DataTypes.STRING(14),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    nombrePersonne: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      validate: {
        min: 1
      }
    },
    Restaurant_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Restaurant',
        key: 'id'
      }
    }
  }, {
    tableName: 'Reservation'
  });
};
