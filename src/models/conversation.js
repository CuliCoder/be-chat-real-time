"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  conversation.init(
    {
      user_one: DataTypes.INTEGER,
      user_two: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
      last_message: DataTypes.STRING,
      user_send_last_message: DataTypes.INTEGER,
      iv: DataTypes.STRING,
      is_seen: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "conversation",
    }
  );
  return conversation;
};
