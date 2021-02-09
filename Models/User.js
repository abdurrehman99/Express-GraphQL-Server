const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  passowrd: {
    type: String,
  },
  todos: {
    type: Array,
  },
});

module.exports = mongoose.model("User", UserSchema);
