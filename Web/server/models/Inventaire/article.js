/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Article', {
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
    quantite: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    unite: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    typeArticle: {
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
    tableName: 'Article'
  });
};
