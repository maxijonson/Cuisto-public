/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Punch', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    debut: {
      type: DataTypes.TIME,
      allowNull: true
    },
    fin: {
      type: DataTypes.TIME,
      allowNull: true
    },
    pauseDebut: {
      type: DataTypes.TIME,
      allowNull: true
    },
    pauseFin: {
      type: DataTypes.TIME,
      allowNull: true
    },
    Quart_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Quart',
        key: 'id'
      }
    }
  }, {
    tableName: 'Punch'
  });
};
