import express from "express";
import userController from "../controller/userController.js";
import postController from "../controller/postController.js";
import auth from "../middleWare/authMiddleWare.js";

const router = express.Router();
//userController endPoints
router.post("/user", userController.createUser);
router.post("/userlogin", userController.login);
router.post("/userlogout", auth, userController.logout);
router.get("/userrefresh", userController.refreshToken);

//postController endPoints
router.post("/post", auth, postController.createPost);
router.put("/postupdate", auth, postController.updatePost);
router.delete("/post/:postId", auth, postController.deletePost);
router.get("/post/:postId", auth, postController.getPostById);
router.get("/post", auth, postController.getAllPosts);

export default router;
