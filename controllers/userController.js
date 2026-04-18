const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Property = require("../models/Property");
const contactRequest = require("../models/contactRequest");
const Request = require("../models/Request");
const { default: mongoose } = require("mongoose");
const Otp = require("../models/Otp");
const nodeMailer = require('nodemailer');

exports.sendMail = async (data,req,res)=>{
    try {
      const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_ID,
          pass: process.env.MAIL_PASS,
        },
      });
      
        const info = await transporter.sendMail({
          from: `"Namaste.in" <${data.from}>` , 
          to: data.to, 
          subject: data.subject, 
          text: data.text, 
          html: data.html, 
        });
      
        console.log("Message sent: %s", info.messageId);
      
    } catch (error) {
      
      throw new Error(error)
    }
  
};


const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if(user) {
        return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOtp();

    await Otp.deleteMany({ email });

    await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 60 * 1000), // 1 minute 
    });

     await this.sendMail({
        from: process.env.MAIL_ID,
        to: email,
        subject: "Your OTP for Signup",
        text: `Your OTP is ${otp}. It is valid for 1 minute.`,
        html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 1 minute.</p>`,
    });
    console.log("OTP", otp);

    res.json({ message: "OTP sent" });
    
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email, otp });

  if (!record) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  await Otp.deleteMany({ email });

  res.json({ message: "OTP verified" });
};

exports.register = async(req, res) => {    
    try {
        const { email, password, name } = req.body;        

        if(!email || !password || !name) {
            return res.status(400).json({ message: "All fields required" });
        }

        const userExists = await User.findOne({ email });
        if(userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ token: generateToken(user) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async(req, res) => {    
    try {
        const { email, password } = req.body;

        if(!email || !password) {            
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if(user.accountStatus === "blocked") {
            return res.status(403).json({ message: "Your account is blocked due to multiple failed verifications." });
        }

        res.json({ token: generateToken(user), });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.applyForOwner = async(req, res) => {
    try {
        console.log("ID", req);
        
        const userId = await User.findById(req.user.id);

        const updates = {};

        if (req.files?.idProof) {
            updates["documents.idProof"] =
            req.files.idProof[0].path;
        }

        if (req.files?.propertyProof) {
            updates["documents.propertyProof"] =
            req.files.propertyProof[0].path;
        }    
        
        if (req.body.removeProfilePic === "true") {
            updates.profilePic = "";
        }

        if (req.body.removeIdProof === "true") {
            updates["documents.idProof"] = "";
        }

        if (req.body.removePropertyProof === "true") {
            updates["documents.propertyProof"] = "";
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true }
        );

        if(user.verificationStatus === "blocked") {
            return res.status(403).json({ message: "Account blocked. Cannot apply again" });
        }

        if(user.verificationStatus === "pending") {            
            return res.status(400).json({ message: "Already applied" });
        }

        user.verificationStatus = "pending";

        await user.save();

        res.json({ user, message: "Application sumbitted for approval" });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: error.message });
    }
}

exports.requestContact = async (req, res) => {
    try {
        const { propertyId, message } = req.body;
        const property = await Property.findById(propertyId);

        const request = await contactRequest.create({
            property: property._id,
            requester: req.user.id,
            owner: property.createdBy,
            message,
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getOwnerRequests = async (req, res) => {
  try {    
    const properties = await Property.find({ createdBy: req.user.id });    

    const propertyIds = properties.map((p) => p._id);

    const requests = await Request.aggregate([
    {
        $match: {
        property: { $in: propertyIds },
        },
    },

    {
        $lookup: {
            from: "users",
            localField: "requester",
            foreignField: "_id",
            as: "user",
        },
    },

    {
    $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
    },
    },

    {
        $lookup: {
            from: "properties",
            localField: "property",
            foreignField: "_id",
            as: "property",
        },
    },

    {
    $unwind: {
        path: "$property",
        preserveNullAndEmptyArrays: true,
    },
    },

    {
        
    $project: {
        message: 1,
        status: 1,
        createdAt: 1,
        userEmail: "$user.email",
        propertyTitle: "$property.title",
    },
    },
    ]);
      
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.mobile) updates.mobile = req.body.mobile;

    if (req.files?.profilePic) {
      updates.profilePic = req.files.profilePic[0].path;
    }

    if (req.files?.idProof) {
      updates["documents.idProof"] =
        req.files.idProof[0].path;
    }

    if (req.files?.propertyProof) {
      updates["documents.propertyProof"] =
        req.files.propertyProof[0].path;
    }    
    
    if (req.body.removeProfilePic === "true") {
        updates.profilePic = "";
    }

    if (req.body.removeIdProof === "true") {
        updates["documents.idProof"] = "";
    }

    if (req.body.removePropertyProof === "true") {
        updates["documents.propertyProof"] = "";
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );

    res.status(201).json({ message: "Update successful" });
  } catch (error) {
    console.log("UPDATE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserApplications = async (req, res) => {
    const id = req.user.id;
    console.log("ID", id);

    const requests = await Request.aggregate([
    {
        $match: {
            user: new mongoose.Types.ObjectId(id),
        },
    },
    {
        $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
        },
    },
    {
    $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
    },
    },

    {
        $lookup: {
        from: "properties",
        localField: "property",
        foreignField: "_id",
        as: "property",
        },
    },

    {
    $unwind: {
        path: "$property",
        preserveNullAndEmptyArrays: true,
    },
    },

    {
        
    $project: {
        message: 1,
        status: 1,
        createdAt: 1,
        user: "$user",
        property: "$property",
    },
    },
    ]);
    console.log("My app", requests);

    res.json(requests);
};