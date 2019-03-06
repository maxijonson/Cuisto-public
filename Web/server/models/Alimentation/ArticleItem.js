/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ArticleItem', {
    Article_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Article',
        key: 'id'
      }
    },
    Item_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Item',
        key: 'id'
      }
    }
  }, {
    tableName: 'ArticleItem'
  });
};
