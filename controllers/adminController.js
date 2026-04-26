const { default: mongoose } = require("mongoose");
const Property = require("../models/Property");
const User = require("../models/User");
const Request = require("../models/Request");

exports.getOwnerRequests = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const query = {};

    if (status === "all") {
      query.$or = [
            { role: "owner", verificationStatus: "approved" },
            { role: "user", verificationStatus: { $in: ["pending", "rejected"] } }
        ]
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if(status !== "all") {
        query.role = "owner";
        query.verificationStatus = status;
    }

    if (status === "rejected" || status === "pending") {
        query.role = "user";
        query.verificationStatus = status;
    }    

    const skip = (page - 1) * limit;    

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });        

    const total = await User.countDocuments(query);

    const statusCounts = await User.aggregate([
        {
            $group: {
                _id: "$verificationStatus",
                count: { $sum: 1 },
            },
        },
    ]);

    const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
    };

        statusCounts.forEach((item) => {
        counts[item._id] = item.count;
    });

    res.json({
      data: users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      counts,
      totalUsers: await User.countDocuments({
        $or: [
            { role: "owner", verificationStatus: "approved" },
            { role: "user", verificationStatus: { $in: ["pending", "rejected"] } }
        ]
        })
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveOwner = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log("APPROVE OWNER", id, status);

        const user = await User.findByIdAndUpdate(
            id,
            { verificationStatus: status,
                role: "owner"
            },
            { new: true }
        );

        await user.save();

        res.json({ message: "User request approved as owner" });
    } catch (error) {        
        res.status(500). json({ message: error.message });
    }
}

exports.rejectOwner = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log("REJECT OWNER", id, status);
        

        const user = await User.findById(id);

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.rejectionDetails.count += 1;

        user.rejectionDetailsrejectedAt = new Date();

        if(user.rejectionDetails.count >= 4) {
            user.accountStatus = "blocked";
        }

        const result = await User.findByIdAndUpdate(
            id,
            { verificationStatus: status },
            { new: true }
        );

        console.log("RESULT", result);
        

        await user.save();

        res.json({ message: 
            user.accountStatus === "blocked" ?
            "Account blocked after multiple rejections"
            : "Application rejected with reason",
        rejectionCount: user.rejectionDetails.count });
    } catch (error) {
        console.log("ERR1", error);
        res.status(500). json({ message: error.message });
    }
}
exports.getStats = async (req, res) => {
    const users = await User.countDocuments();
    const owners = await User.countDocuments({ role : "owner" });
    const properties = await Property.countDocuments();
    // const requests = await Request.countDocuments();

    res.json({
        users,
        owners,
        properties,
        // requests,
    });
}

exports.getUsersList = async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $match: {
                    role: { $in: ["owner", "user"] }
                }
            }
        ]);
        return res.json(users);
    } catch (error) {
        res.status(500). json({ message: error.message });
    }
}

exports.getUserById = async (req, res) => {
    try {
        console.log(req.params.id);
        
        const user = await User.findById(req.params.id);
        return res.json(user);
    } catch (error) {
        res.status(500). json({ message: error.message });
    }
}

exports.getActivateBlockUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        console.log("STATUS", status);

        const user = await User.findByIdAndUpdate(
            id,
            { accountStatus: status },
            { new: true }
        );

        if(!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.json({ message: "User status changed" });
    } catch (error) {
        res.status(500). json({ message: error.message });
    }
}

exports.getApplicationsForPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Property ID:", id);
        
        
        const requests = await Request.aggregate([
            {
                $match: {
                    property: new mongoose.Types.ObjectId(id),
                },
            },
            {
                $lookup: {
                from: "users",
                localField: "user",
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

        console.log("Requests", requests);
        
        
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}