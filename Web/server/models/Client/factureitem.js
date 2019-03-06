/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('FactureItem', {
      Item_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Item',
          key: 'id'
        }
      },
      Facture_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Facture',
          key: 'id'
        }
      }
    }, {
      tableName: 'FactureItem'
    });
  };
  