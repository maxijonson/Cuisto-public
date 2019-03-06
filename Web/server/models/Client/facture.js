/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Facture', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
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
    tableName: 'Facture'
  });
};
