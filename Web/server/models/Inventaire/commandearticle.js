/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('CommandeArticle', {
    CommandeFournisseur_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'CommandeFournisseur',
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
    quantite: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'CommandeArticle'
  });
};
