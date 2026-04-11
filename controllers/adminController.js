const Property = require("../models/Property");
const User = require("../models/User");

exports.getPendingOwners = async(req, res) => {
    try {
        const users = await User.find({ verificationStatus: "pending", }).select("-password");

        res.json(users);
    } catch (error) {
        res.status(500). json({ message: error.message });
    }
}

exports.approveOwner = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = "owner";
        user.verificationStatus = "approved";

        await user.save();

        res.json({ message: "User approved as owner" });
    } catch (error) {
        res.status(500). json({ message: error.message });
    }
}

exports.rejectOwner = async(req, res) => {
    try {
        const { reason } = req.body;

        if(!reason) {
            return res.status(400).json({ message: "Rejection reason required" });
        }

        const user = await User.findById(req.params.id);

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.rejectionDetails.count += 1;

        user.verificationStatus = "rejected";
        user.rejectionDetails.reason = reason;
        user.rejectionDetailsrejectedAt = new Date();

        if(user.rejectionDetails.count >= 4) {
            user.accountStatus = "blocked";
        }

        await user.save();

        res.json({ message: 
            user.accountStatus === "blocked" ?
            "Account blocked after multiple rejections"
            : "Application rejected with reason",
        rejectionCount: user.rejectionDetails.count });
    } catch (error) {
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