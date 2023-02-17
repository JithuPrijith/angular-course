const router = require("express").Router();
const checkAuth = require("../middleware/auth");
const {
  addPost,
  updatePost,
  deletePost,
  getPosts,
  getPost,
} = require("../controllers/post");
const multerLogic = require("../middleware/multer")

router.post("",checkAuth,multerLogic,addPost);

router.get("", getPosts);

router.get("/:id", getPost);

router.delete("/:id", checkAuth, deletePost);

router.put("/:id",checkAuth,multerLogic,updatePost);

module.exports = router;
