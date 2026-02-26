const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Saluun Backend Running 🚀");
});

app.use("/api/auth", authRoutes);

const errorHandler = require("./middleware/errorMiddleware");

app.use(errorHandler);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});

app.get("/api/profile", authMiddleware, (req,res)=>{

    res.json({
        message:"Protected Data",
        userId:req.user.id
    });

});
