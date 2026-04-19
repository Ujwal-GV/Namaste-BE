const Property = require("../models/Property");
const User = require("../models/User");

exports.getOwnerRequests = async (req, res) => {
  try {
    const {
      status = "all",
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const query = {
        role: "owner"
    };

    if (status !== "all") {
      query.verificationStatus = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "rejected" || status === "pending") {
        query.role = "user";
    }

    console.log("QUERY", query);
    

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });  
      
     console.log("USERS OWNER PENDING", users);
      

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
      totalUsers: await User.countDocuments({ role: "owner", verificationStatus: ["pending", "approved", "rejected"] })
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
        console.log("ERR", error);
        
        res.status(500). json({ message: error.message });
    }
}

exports.rejectOwner = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log("REJECT OWNER", id, status);
        

        const user = await User.findById(id);

        console.log("USER", user);
        

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