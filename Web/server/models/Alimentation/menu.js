/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: true
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
    tableName: 'Menu'
  });
};
