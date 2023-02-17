const Post = require("../models/postModel");

module.exports = {
  addPost: (req, res) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
    });
    post
      .save()
      .then((createdPost) => {
        res.status(201).json({
          message: "post added successfully",
          post: {
            ...createdPost._doc,
            id: createdPost._id,
          },
        });
      })
      .catch((err) => {
        res.status(500).json({ message: "creating post failed" });
      });
  },

  updatePost: (req, res) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId,
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
      .then((result) => {
        console.log(result);
        if (result.modifiedCount > 0) {
          res.status(200).json(result);
        } else {
          res.status(401).json({ message: "unauthorized error" });
        }
      })
      .then((err) => {
        res.status(500).json({ message: "coudn't update post" });
      });
  },

  deletePost: (req, res) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(
      (result) => {
        console.log(result);
        if (result.deletedCount > 0) {
          res.status(200).json({ message: "post deleted!" });
        } else {
          res.status(401).json({ message: "unauthorized error" });
        }
      }
    );
  },

  getPosts: (req, res) => {
    const pageSize = req.query.pagesize;
    const currentPage = req.query.page;
    let fetchPosts;
    const postQuery = Post.find();
    if (pageSize && currentPage) {
      postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery
      .find()
      .then((documents) => {
        fetchPosts = documents;
        return Post.count();
      })
      .then((count) => {
        res.status(200).json({
          message: "Post fetched successfully",
          posts: fetchPosts,
          maxpost: count,
        });
      })
      .catch((err) => {
        res.status(500).json({ message: "fetching post failed" });
      });
  },

  getPost: (req, res) => {
    Post.findById(req.params.id)
      .then((post) => {
        if (post) {
          res.status(200).json(post);
        } else {
          res.status(404).json({ message: "post not found" });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: "fetching post failed" });
      });
  },
};
