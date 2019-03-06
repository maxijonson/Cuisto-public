/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Token', {
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    Employe_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      primaryKey: false,
      references: {
        model: 'Employe',
        key: 'id'
      }
    },
    Organisation_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      primaryKey: false,
      references: {
        model: 'Organisation',
        key: 'id'
      }
    }
  }, {
    tableName: 'Token'
  });
};
