const asyncHandler = require("../utils/asyncHandler");
const { formatSuccessResponse } = require("../utils/response");
const AuthService = require("../services/authService");


const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await AuthService.getUserById(userId);
    res.json(formatSuccessResponse(user, "User profile fetched"));
});


module.exports = { getProfile };