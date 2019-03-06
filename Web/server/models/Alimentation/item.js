/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Item', {
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
    prix: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    Menu_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Menu',
        key: 'id'
      }
    },
    typeItem: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'Item'
  });
};
