import userModel from "../models/user.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from "../config/emailconfig.js";


class UserController {

    //registration
    static userRegistration = async (req, res) => {
      const { name, email, password, password_confirmation, tc } = req.body
      const user = await userModel.findOne({ email: email })
      if (user) {
        res.send({ "status": "failed", "message": "Email already exists" })
      } else {
        if (name && email && password && password_confirmation && tc) {
          if (password === password_confirmation) {
            try {
              const salt = await bcrypt.genSalt(10)
              const hashPassword = await bcrypt.hash(password, salt)
              const doc = new userModel({
                name: name,
                email: email,
                password: hashPassword,
                tc: tc
              })
              await doc.save()
              const saved_user = await userModel.findOne({email:email})

              //JWT TOKEN
              const token = jwt.sign({userID: saved_user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '15m'})

              res.status(201).send({ "status": "success", "message": "Registration Success", "token": token})
            } catch (error) {
              console.log(error)
              res.send({ "status": "failed", "message": "Unable to Register" })
            }
          } else {
            res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
          }
        } else {
          res.send({ "status": "failed", "message": "All fields are required" })
        }
      }
    }



    //login
    static userLogin = async (req, res)=> {
        try {
            const {email, password} =req.body
            if(email && password){
                const user = await userModel.findOne({email: email})
                if(user !=null){
                    const isMatch = await bcrypt.compare(password, user.password)
                    if((user.email=== email) && isMatch){

                        // jwt token
                        const token = jwt.sign({userID: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '15m'})

                        res.send({"status": "sucess", "message":"login sucess", "token": token})
                    }else{
                        res.send({ "status": "failed", "message": "email and password are not match" })
                    }
                }else(
                    res.send({"message": "user not registered"})
                )

            }else{
                res.send({ "status": "failed", "message": "All fields are required" })
            }
            
        } catch (error) {
            console.log(error)
        }
    }


    //password Change

   static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
      } else {
        const salt = await bcrypt.genSalt(10)
        const newHashPassword = await bcrypt.hash(password, salt)
        await userModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
        res.send({ "status": "success", "message": "Password changed succesfully" })
      }
    } else {
      res.send({ "status": "failed", "message": "All Fields are Required" })
    }
  }
  static loggedUser = async(req, res) =>{
    res.send({"user": req.user})
  }

  static sendUserPasswordResetEmail = async (req,res) =>{
    const {email} = req.body
    if(email){
        const user = await userModel.findOne({email: email})
        if(user){
            const secret = user._id + process.env.JWT_SECRET_KEY

            const token = jwt.sign({userID: user._id}, secret, {expiresIn : '15m'})
            const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`
            console.log(link)

            //send email

            // // Send Email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "TALHA - Password Reset Link",
          html: `<a href=${link}>Click Here</a> to Reset Your Password`
        })
            res.send({"status": "success", "message": "Password Reset Email sent.. Please check your Email"})
        }else{
            res.send({ "status": "failed", "message": "Email does not exist" })
        }
    }else {
        res.send({ "status": "failed", "message": "Email is Required" })

    }
  }

  static userPasswordReset = async (req, res )=> {
    const { password, password_confirmation } = req.body
    const {id, token} = req.params 
    const user = await userModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET_KEY
    try {
        jwt.verify(token, new_secret)
        if(password && password_confirmation){

            if(password!==password_confirmation){

                res.send({"status": "failed", "message": "New Password & Confirm password does not match"})

            }else{
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password, salt)
                await userModel.findByIdAndUpdate(user._id, {$set: {password: newHashPassword}})
                res.send({"status": "success", "message": "Password change successfully"})
            }

        } else {
            res.send({"status": "failed", "message": "All feilds are required"})
        }
    } catch (error) {
        console.log(error)
        res.send({"status": "failed", "message": "Invalid Token"})
    }
  }

}
export default UserController