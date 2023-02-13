const router = require("express").Router();
const Post = require("../models/postModel");
const multer = require("multer");

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
}

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error("invalid mime type");
        if(isValid){
            error = null;
        }
        cb(error,"backend/images")
    },
    filename :(req,file,cb) =>{
        const name = file.originalname.toLowerCase().split(" ").join("-");
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
})

router.post("", multer({storage: storage}).single("image") ,(req, res) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename
  });
  post.save().then((createdPost) => {
    res.status(201).json({
        message :"post added successfully",
        post: {
            ...createdPost._doc,
            id:createdPost._id
        }
    });
  });
});

router.get("", (req, res) => {
  const pageSize = req.query.pagesize;
  const currentPage = req.query.page;
  let fetchPosts;
  const postQuery = Post.find();
  if(pageSize && currentPage){
    postQuery.skip(pageSize * (currentPage - 1))
    .limit(pageSize);
  }
  postQuery.find().then((documents) => {
    fetchPosts = documents;
    return Post.count();
  })
  .then((count) => {
    res.status(200).json({
      message : "Post fetched successfully",
      posts: fetchPosts,
      maxpost: count
    })
  })
});

router.get("/:id", (req, res) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "post not found" });
    }
  });
});

router.delete("/:id", (req, res) => {
  Post.deleteOne({ _id: req.params.id }).then((result) => {
    res.status(200).json({ message: "post deleted!" });
  });
});

router.put("/:id", multer({storage: storage}).single("image") , (req, res) => {
    let imagePath = req.body.imagePath
    if(req.file){
        const url = req.protocol + '://' + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
    }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath : imagePath
  });
  Post.updateOne({ _id: req.params.id }, post).then((result) => {
    console.log(result);
    res.status(200).json(result);
  });
});

module.exports = router;
