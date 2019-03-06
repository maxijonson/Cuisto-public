/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Table', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    maxPlace: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      validate: {
        min: 1
      }
    },
    Salle_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Salle',
        key: 'id'
      }
    },
    nom: {
      type: DataTypes.STRING(15),
      allowNull: true
    }
  }, {
    tableName: 'Table'
  });
};
