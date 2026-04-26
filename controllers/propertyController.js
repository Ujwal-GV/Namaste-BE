const Property = require("../models/Property");
const Request = require("../models/Request");
const { createNotification } = require("../utilities/notificationHelper");

exports.addProperty = async (req, res) => {
    console.log("Add property1", req.user.id);
    console.log("RE HEADERS", req.headers["content-type"]);
    
    
  try {
    const { title, location, rent, deposit, detailedAddress, description } = req.body;
    // console.log("Add property", req.body);
    // console.log("Files", req.files);
    

    const imgUrls = req.files?.map((file) => file.path) || [];

    console.log("Image urls in add", imgUrls);
    
    

    if (!title || !location || !rent || !deposit || !detailedAddress || !description) {
        console.log("All fields reqired");
        return res.status(400).json({ message: "Required fields missing" });
    }

    console.log("Passed");
    
    const property = await Property.create({
      title,
      location,
      rent,
      deposit,
      detailedAddress,
      images: imgUrls,
      description,
      createdBy: req.user.id,
    });

    res.status(201).json(property);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const { search = "", page = 1, location = "" , limit} = req.query;

    const query = {
        $or: [
             {location: {$regex: search, $options: "i"}},
             {title: {$regex: search, $options: "i"}},
        ],
    };

    if (location) {
      query.location = location;
    }

    const total = await Property.countDocuments(query);

    const properties = await Property
    .find(query)
    .populate("createdBy", "email role")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

    res.json({
        properties,
        total,
        page,
        pages: Math.ceil(total/limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "createdBy",
      "email role"
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    console.log("Enter edit property with body" + req.body);

    let updatedData = { ...req.body };
    
    if(req.files && req.files.length > 0) {
        const imgUrls = req.files?.map((file) => file.path);
        updatedData.images = imgUrls;
    }
    

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.deleteOne();

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProperties = async (req, res) => {
  try {    
    const { id } = req.params;
    
    const data = await Property.find({
      createdBy: id,
    }).sort({ createdAt: -1 });
    
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {    
    const { requestId } = req.params;
    const { status } = req.body;

    console.log("Entered update", status)

    const request = await Request.findById(requestId).populate("property");        

    if (!request) {        
      return res.status(404).json({ message: "Request not found" });
    }

    // Only owner of property can update
    if (request.property.createdBy.toString() !== req.user.id) {        
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = status;

    await request.save();

    const userId = (await Request.findById(requestId, { user: 1 })).user;
    const propertyTitle = request.property.title;
    

    await createNotification({
      userId: userId,
      type: "STATUS",
      title: "Application Update",
      message: `Your application for ${propertyTitle} was ${status}`,
      link: "/user-applications",
    });

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};