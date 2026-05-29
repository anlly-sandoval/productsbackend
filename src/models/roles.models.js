import mongoose from "mongoose";

const rolesSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    trim: true
  }
});//fin de roleSchema

export default mongoose.model("Role", rolesSchema);