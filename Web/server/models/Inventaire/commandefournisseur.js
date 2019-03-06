/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('CommandeFournisseur', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        Fournisseur_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'Fournisseur',
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    }, {
            tableName: 'CommandeFournisseur'
        });
};
