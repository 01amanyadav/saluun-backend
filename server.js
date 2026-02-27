const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const shopRoutes = require("./routes/shopRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/shops", shopRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
    res.send("Saluun Backend Running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
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
