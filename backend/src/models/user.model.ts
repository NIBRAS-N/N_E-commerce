import mongoose from "mongoose"
// import { Interface } from "readline";
import validator from "validator";



interface iUser extends Document {
    _id:string;
    name:string;
    photo:string;
    email:string;
    role:"admin"|"user";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    // virtual attribute
    age:number;
}

const userSchema = new mongoose.Schema(
    {
        _id:{
            type:String,
            required: [true,"please enter Id"]
        },
        photo:{
            type:String,
            required:[true,"please add Photo"]
        },
        email:{
            type:String,
            required:[true,"Please enter Email"],
            unique:[true,"Email already exist"],
            validate: validator.default.isEmail
        },
        name:{
            type:String,
            required:[true,"please enter your name"]
        },
        role:{
            type:String,
            enum:["admin","user"],
            default:"user"
        },
        gender:{
            type:String,
            enum:["male","female"]
        },
        dob: {
            type: Date,
            required: [true, "Please enter Date of birth"],
        },
    },
    {timestamps:true}
)

//adding custom getter
//Virtual properties are properties that are not persisted to the database but are computed properties that you can use in your application logic.
userSchema.virtual("age").get(function():number{
    const today = new Date();
    const do_b:Date = this.dob;
    let age:number = today.getFullYear() - do_b.getFullYear();

    if(today.getMonth() < do_b.getMonth() ||  (today.getMonth() === do_b.getMonth() && today.getDate() < do_b.getDate())) age--;

    return age;
});
export const User = mongoose.model<iUser>("User",userSchema)