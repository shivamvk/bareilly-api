const User = require("../models/user");
const Tag = require("../models/tag");

module.exports = extractTagsAndMentions = async (text) => {
  return new Promise(async (resolve, reject) => {
    const strings = text.split(" ");
    let result = { tags: [], mentions: [] };
    for (let i = 0; i < strings.length; i++) {
      string = strings[i];
      if (string[0] === "@") {
        string = string.slice(1);
        let identifiedUser;
        try {
          identifiedUser = await User.findOne({ userName: string });
        } catch (err) {
          reject(err.message);
        }
        if (identifiedUser) {
          result.mentions.push(identifiedUser.id);
        }
      }
    }
    for (let i = 0; i < strings.length; i++) {
      string = strings[i];
      console.log(string);
      if (string[0] === "#") {
        string = string.slice(1);
        let identifiedTag;
        try {
          identifiedTag = await Tag.findOne({ text: string });
        } catch (err) {
          reject(err.message);
        }
        if (identifiedTag) {
          identifiedTag.count = identifiedTag.count + 1;
          await identifiedTag.save();
        } else {
          identifiedTag = new Tag({ text: string });
          await identifiedTag.save();
        }
        result.tags.push(identifiedTag.id);
      }
    }
    resolve(result);
  });
};
