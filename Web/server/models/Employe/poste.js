/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Poste', {
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
    Organisation_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Organisation',
        key: 'id'
      }
    }
  }, {
    tableName: 'Poste'
  });
};
