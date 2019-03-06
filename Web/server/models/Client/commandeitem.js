/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CommandeItem', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Item_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Item',
        key: 'id'
      }
    },
    Commande_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Commande',
        key: 'id'
      }
    }
  }, {
    tableName: 'CommandeItem'
  });
};
