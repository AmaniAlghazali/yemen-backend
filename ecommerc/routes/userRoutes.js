import express from "express";
import {
  deleteUserProfileController,
  loginUserController,
  logoutUser,
  resetPasswordController,
  resetPasswordRequestController,
  resgisterUserController,
  updatePasswordController,
  updateUserProfileController,
  userProfileController,
  getUserPhotoByEmail,
  getAllUsers,
  combineData,
  updateUserProfile,
  deleteUser,
  contactController,
  getContactMessages
} from "../controllers/userController.js";
import { isAuthenticatedUser } from "../util/userAuth.js";
const userRouter = express.Router();

userRouter.post("/register-user", resgisterUserController);
userRouter.post("/login-user", loginUserController);
userRouter.get("/profile", isAuthenticatedUser, userProfileController);
userRouter.get("/get-photo/:email", getUserPhotoByEmail);
userRouter.put(
  "/update-profile",
  isAuthenticatedUser,
  updateUserProfileController,
);
userRouter.delete(
  "/delete-profile",
  isAuthenticatedUser,
  deleteUserProfileController,
);
userRouter.get("/logout", isAuthenticatedUser, logoutUser);
userRouter.post("/reset-password-request", resetPasswordRequestController);
userRouter.post("/reset-password/:token", resetPasswordController);
userRouter.post("/update-password", isAuthenticatedUser,updatePasswordController);
userRouter.get("/all-users", isAuthenticatedUser,getAllUsers)
userRouter.get("/combine-data", isAuthenticatedUser,combineData)
userRouter.put("/update-user/:id", isAuthenticatedUser,updateUserProfile)
userRouter.delete("/delete-user/:id", isAuthenticatedUser,deleteUser)
userRouter.post("/contact", contactController);
userRouter.get("/contact-messages", isAuthenticatedUser, getContactMessages);
export default userRouter;
