const express = require("express");
const app = express();

// for server side validation 
const Joi = require ("joi");

//for our file uploads 
const multer = require ("multer");

app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // for our images 
app.use(express.json());

// for crossing domains
const cors = require("cors");
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
  
const upload = multer({ storage: storage });

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://emmahubert28:fDW6hpOv0EHpai0w@cluster0.azeihw5.mongodb.net/"
  )
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
});

const brandSchema = new mongoose.Schema({
    //_id: mongoose.SchemaTypes.ObjectId,
    name: String,
    description: String,
    products: [String],
    main_image: String,
    userName: String,
});
  
const Brand = mongoose.model("Brand", brandSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/api/brands", (req, res)=>{
    getBrands(res);
});

const getBrands = async (res) => {
    const brands = await Brand.find();
    res.send(brands);
}

app.get("/api/brands/:id", (req, res) => {
    getBrand(req.params.id, res);
});
  
const getBrand = async (id, res) => {
    const brand = await Brand.findOne({ _id: id });
    res.send(brand);
};

app.post("/api/brands", upload.single("img"), (req, res) => {
    console.log("made it in the post");
    console.log(req.file);
    const result = validateBrand(req.body);
  
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
  
    const brand = new Brand ({
        name: req.body.name,
        description: req.body.description,
        products: req.body.products.split(","),
        userName: req.body.userName,
    });
  
    if (req.file) {
      console.log("uploaded image");
      brand.main_image = "images/" + req.file.filename;
    }
  
    createBrand(brand, res);
});

const createBrand = async (brand, res) => {
    const result = await brand.save();
    res.send(brand);
}

app.put("/api/brands/:id", upload.single("img"), (req, res) => {
    console.log("puuting");
    const result = validateBrand(req.body);
    console.log(result);
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
      }
      updateBrand(req, res);
});

const updateBrand = async (req, res) => {
    let fieldsToUpdate = {
      name: req.body.name,
      description: req.body.description,
      products: req.body.products.split(","),
    };
  
    if (req.file) {
      console.log("updating image");
      fieldsToUpdate.main_image = "images/" + req.file.filename;
    }
  
    const result = await Brand.updateOne({ _id: req.params.id }, fieldsToUpdate);
  
    res.send(result);
};

app.delete("/api/brands/:id" , (req, res) => {
    removeBrand(res, req.params.id);
});

const removeBrand = async (res, id) => {
    const brand = await Brand.findByIdAndDelete(id);
    res.send(brand);
};
  
function validateBrand(brand) {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().min(20).required(),
      products: Joi.allow(""),
      _id: Joi.allow(""),
      userName: Joi.string().required(),
    });
    return schema.validate(brand);
};


app.listen(3000, ()=>{
    console.log("i am listening");
});