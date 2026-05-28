const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

router.post(
  "/",
  upload.single("file"),
  (req, res) => {

    res.status(200).json({
      success: true,
      file: req.file,
      fileUrl:
        "http://localhost:5000/uploads/" +
        req.file.filename,
    });

  }
);

module.exports = router;