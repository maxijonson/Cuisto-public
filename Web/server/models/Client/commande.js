/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Commande', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Employe_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'Employe',
        key: 'id'
      }
    },
    statut: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    Table_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Table',
        key: 'id'
      }
    },
    client: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
      tableName: 'Commande'
    });
};
