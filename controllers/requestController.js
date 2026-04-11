const Request = require("../models/Request");
const Property = require("../models/Property");
const { default: mongoose } = require("mongoose");

exports.applyToProperty = async (req, res) => {
    try {
        const { propertyId, message } = req.body;
        console.log("Entered request fro apply property", req.body);
        

        const property = await Property.findById(propertyId);

        if(!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const existing = await Request.findOne({
            property: propertyId,
            user: req.user.id,
        });

        if(existing) {
            return res.status(400).json({ message: "Already applied to this property" });
        }

        const request = await Request.create({
            property: propertyId,
            user: req.user.id,
            owner: property.createdBy,
            message,
        });

        return res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getOwnerRequests = async (req, res) => {
    try {
        const properties = await Property.find({ createdBy: req.user.id});        

        const propertyIds = properties.map((p) => p._id);


        // const requests = await Request.find({
        //     owner: req.user.id,
        // })
        // .populate("user", "name email")
        // .populate("property", "title, location");

        const requests = await Request.aggregate([
            {
                $match: {
                    property: { $in: propertyIds },
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
                    userEmail: "$user.email",
                    propertyTitle: "$property.title",
                },
            },
        ]);

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getPropertyRequestsById = async (req, res) => {
    try {
        const { id } = req.params;
        const propertyName = await Property.findById(id).select("title");        
        
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
                    userName: "$user.name",
                    userEmail: "$user.email",
                    propertyTitle: "$property.title",
                },
            },
        ]);
        
        res.json({requests, "propertyName": propertyName.title });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getMyRequestForProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const request = await Request.findOne({
      property: propertyId,
      user: req.user.id,
    });

    res.json(request); // can be null
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};