import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  isDefaultCategoriesSet: { type: Boolean, default: false },
});

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
