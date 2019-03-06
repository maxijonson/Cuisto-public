/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Fournisseur', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    adresse: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    telephone: {
      type: DataTypes.STRING(14),
      allowNull: false,
      validate: {
        is: /^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/g
      }
    },
    personneRessource: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        is: /(?:(?![×Þß÷þø])[a-zÀ-ÿ\s\-\'])+$/g
      }
    },
    courriel: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        isEmail: true
      }
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
    tableName: 'Fournisseur'
  });
};
