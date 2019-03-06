/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Quart', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Employe_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'Employe',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    debut: {
      type: DataTypes.TIME,
      allowNull: false
    },
    fin: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: 'Quart'
  });
};
