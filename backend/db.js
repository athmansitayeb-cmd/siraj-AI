import { Sequelize, DataTypes } from "sequelize";
import path from "path";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(process.cwd(), "siraj.sqlite"),
  logging: false,
});

export const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export async function initDB() {
  await sequelize.sync();
  console.log("✅ Database ready");
}

export default sequelize;
