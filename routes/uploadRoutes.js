const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

router.post(
  "/",
  upload.single("file"),
  (req, res) => {
    const host = req.get("host");
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      file: req.file,
      fileUrl: fileUrl,
    });
  }
);

module.exports = router;