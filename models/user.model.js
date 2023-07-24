import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema({
    fullName: {
        type: "String",
        required: [true, "Name is required"],
        minLength: [5, "Name must be at least 5 character"],
        maxLength: [50, "Name should be less than 50 character"],
        lowercase: true,
        trim: true
    },
    email: {
        type: "String",
        required: [true, "E-mail is required"],
        lowercase: true,
        trim: true,
        unique: true,
        // match: []
    },
    password: {
        type: "String",
        required: [true, "Password is required"],
        minLength: [8, "Password must be at least 8 character"],
        select: false
    },
    avatar: {
        public_id: {
            type: "String"
        },
        secure_url: {
            type: 'String'
        }
    },
    role: {
        type: 'String',
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next()
    };
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods = {
    generateJWTToken: async function() {                    // Generating token for user
        return await jwt.sign(
            { id: this._id, email: this.email, subscription: this.subscription, role: this.role },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        )
    },
    comparePassword: async function(plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password)
    },
    generatePasswordResetToken: async function() {
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto                  // Hashing token 
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
        ;
        this.forgotPasswordExpiry = Date.now + 15 * 60 * 1000;      // 15 min from now expires token
    }
}

const User = model('User', userSchema);

export default User