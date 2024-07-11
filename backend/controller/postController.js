import Joi from "joi";
import fs from "fs";
import Post from "../models/post.js";
import { BACKEND_URL } from "../config/index.js";

const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

const postController = {
  //create post method
  async createPost(req, res, next) {
    const createPostSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      photopath: Joi.string(),
      author: Joi.string().regex(mongoIdPattern).required(),
    });

    const { error } = createPostSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { title, content, photopath, author } = req.body;
    let post;

    if (photopath) {
      //save photo in the buffer
      const buffer = Buffer.from(
        photopath.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      //allocate randam name to the photo
      const imagePath = `${Date.now()}-${author}.png`;
      //save photo locally in the folder
      fs.writeFileSync(`storage/${imagePath}`, buffer);
      //save post to the database

      try {
        const newPost = new Post({
          title,
          content,
          author,
          photopath: `${BACKEND_URL}/storage/${imagePath}`,
        });
        post = await newPost.save();
      } catch (error) {
        return next(error);
      }
    } else {
      try {
        const newPost = new Post({
          title,
          content,
          author,
        });
        post = await newPost.save();
      } catch (error) {
        return next(error);
      }
    }
    //sending response
    res.status(201).json({ post });
  },

  //update method
  async updatePost(req, res, next) {
    const updatePostSchema = Joi.object({
      title: Joi.string(),
      content: Joi.string(),
      photopath: Joi.string(),
      postId: Joi.string().required(),
    });
    const { error } = updatePostSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { title, content, photopath, postId } = req.body;
    //fetching the post
    let post;
    try {
      post = await Post.findOne({ _id: postId });
      if (!post) {
        const error = {
          status: 404,
          message: "post not found!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    if (photopath) {
      let previous = post.photopath;
      previous = previous.split("/").pop();
      //delete previous photo
      fs.unlinkSync(`storage/${previous}`);
      //saving new photo in the buffer
      const buffer = Buffer.from(
        photopath.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      //allocate random name to the photo
      const imagePath = `${Date.now()}-${title}.png`;
      //save photo lolcally in the folder
      fs.writeFileSync(`storage/${imagePath}`, buffer);
      //saving the update to the database
      try {
        await Post.updateOne(
          { _id: postId },
          { title, content, photopath: `${BACKEND_URL}/storage/${imagePath}` }
        );
      } catch (error) {
        return next(error);
      }
    } else {
      try {
        await Post.updateOne({ _id: postId }, { title, content });
      } catch (error) {
        return next(error);
      }
    }
    //sending response
    res.status(200).json({ message: "post has been udpated!" });
  },
  //delete post method
  async deletePost(req, res, next) {
    const deletePostSchema = Joi.object({
      postId: Joi.string().regex(mongoIdPattern).required(),
    });
    const { error } = deletePostSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const { postId } = req.params;
    //deleting post from database
    try {
      const post = await Post.findOne({ _id: postId });
      if (!post) {
        const error = {
          status: 404,
          message: "post not found!",
        };
        return next(error);
      }
      await Post.deleteOne({ _id: postId });
    } catch (error) {
      return next(error);
    }
    //sending response
    res.status(200).json({ message: "post has been deleted!" });
  },
  //get post by Id method
  async getPostById(req, res, next) {
    const getPostByIdSchema = Joi.object({
      postId: Joi.string().regex(mongoIdPattern).required(),
    });
    const { error } = getPostByIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    const { postId } = req.params;
    //geting post from database
    let post;
    try {
      post = await Post.findOne({ _id: postId });
      if (!post) {
        const error = {
          status: 404,
          message: "post not found!",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //sending response
    res.status(200).json({ post });
  },
  //get all posts method
  async getAllPosts(req, res, next) {
    //getting all post from the database
    try {
      const posts = await Post.find({});
      const postArr = [];
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        postArr.push(post);
      }
      return res.status(200).json({ posts: postArr });
    } catch (error) {
      return next(error);
    }
  },
};

export default postController;
