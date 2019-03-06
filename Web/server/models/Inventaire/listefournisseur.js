/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ListeFournisseur', {
    Fournisseur_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Fournisseur',
        key: 'id'
      }
    },
    Article_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Article',
        key: 'id'
      }
    },
    prix: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        min: 0
      },
      defaultValue: 0.00
    }
  }, {
    tableName: 'ListeFournisseur'
  });
};
