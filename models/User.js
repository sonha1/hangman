import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    point: { type: String, default: 0 },
});

UserSchema.plugin(passportLocalMongoose);

export default mongoose.model("userHM", UserSchema);