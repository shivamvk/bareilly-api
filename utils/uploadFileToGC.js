const admin = require("firebase-admin");
const { format } = require("util");
const { v4: uuid } = require("uuid");

if(admin.apps.length === 0){
  require("../config/firebase-config");
}

const bucket = admin.storage().bucket();

module.exports = uploadImageToStorage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No image file");
    }
    let newFileName = `${uuid()}_${file.originalname}`;

    let fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (error) => {
      reject(
        error.message + "Something is wrong! Unable to upload at the moment."
      );
    });

    blobStream.on("finish", () => {
      // The public URL can be used to directly access the file via HTTP.
      const url = format(
        `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
      );
      fileUpload
        .getSignedUrl({
          action: "read",
          expires: "01-01-2050",
        })
        .then((signedUrls) => {
          console.log(signedUrls[0]);
          resolve(signedUrls[0]);
        });
    });

    blobStream.end(file.buffer);
  });
};
