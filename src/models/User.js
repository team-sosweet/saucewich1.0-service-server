module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
        id: {
            type: DataTypes.STRING(20),
            primaryKey: true,
        },
        password: {
            type: DataTypes.CHAR(128),
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
        exp: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        kill: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        win: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        lose: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        playtime: {
            type: DataTypes.TIME,
            allowNull: true,
            defaultValue: '00:00:00',
        }
    }, {
        timestamps: false,
    })
};
