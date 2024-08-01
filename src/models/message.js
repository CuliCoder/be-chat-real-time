"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  message.init(
    {
      message: DataTypes.STRING,
      is_seen: DataTypes.BOOLEAN,
      deleted_from_sender: DataTypes.BOOLEAN,
      deleted_from_receiver: DataTypes.BOOLEAN,
      user_id: DataTypes.INTEGER,
      conversation_id: DataTypes.INTEGER,
      iv: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "messages",
    }
  );
  return message;
};
