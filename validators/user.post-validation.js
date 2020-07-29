const { body } = require('express-validator');

const savePostValidationRules = () => {
    return [
        body("text").notEmpty(),
    ];
};

module.exports = {
    savePostValidationRules  
};