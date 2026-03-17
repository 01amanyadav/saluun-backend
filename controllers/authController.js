const asyncHandler = require("../utils/asyncHandler");
const { formatSuccessResponse, formatErrorResponse } = require("../utils/response");
const AuthService = require("../services/authService");


exports.registerUser = asyncHandler(async (req, res) => {
 const { name, email, password } = req.body;

 const user = await AuthService.register(name, email, password);

 res.status(201).json(
    formatSuccessResponse(
       {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
       },
       "User registered successfully"
    )
 );
});


exports.loginUser = asyncHandler(async (req, res) => {
 const { email, password } = req.body;

 const result = await AuthService.login(email, password);

 res.status(200).json(
    formatSuccessResponse(
       result,
       "Login successful"
    )
 );
});