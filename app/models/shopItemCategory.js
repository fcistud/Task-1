module.exports = (sequelize, DataTypes) => {
  const ShopItemCategory = sequelize.define('ShopItemCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  return ShopItemCategory;
};