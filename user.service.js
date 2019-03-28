import joi from 'joi';
import bcrypt from 'bcryptjs';

export default {

    encryptPassword(plainPass) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(plainPass, salt);
    },

    comparePassword(plainPass,hashPass) {
        return bcrypt.compareSync(plainPass,hashPass);
    },
}