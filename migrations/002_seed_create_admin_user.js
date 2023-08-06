const fs = require('fs');
const path = require('path');
const {hashPassword} = require("../utils/password-utils");

const createAdminUser = async (db) => {
    const adminRole = await db.collection('roles').findOne({name: 'admin'});

    if (!adminRole) {
        throw new Error('Admin role not found in the database');
    }
    // Read the admin_secrets.json file from one directory up
    const secretsPath = path.join(process.cwd(), 'admin_secrets.json');
    const adminSecrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));



    const {
        email,
        password,
        suspended,
        cart,
        active,
        wishlist,
        gender,
        blocked,
        middleName,
        phoneNumber,
        firstName,
        username,
        surname,
        terms,
        resetPasswordLink,
    } = adminSecrets;

    const hashed_password = await hashPassword(password);

    const currentDate = new Date();

    const adminData = {
        firstName,
        resetPasswordLink,
        username,
        gender,
        blocked,
        suspended,
        cart,
        wishlist,
        surname,
        middleName,
        phoneNumber,
        email,
        active,
        role: adminRole._id,
        terms,
        hashed_password,
        createdAt: currentDate,
        updatedAt: currentDate,
    };

    const existingAdmin = await db.collection('users').findOne({email});
    console.log(existingAdmin)
    if (!existingAdmin) {
       const user= await db.collection('users').insertOne(adminData);
        console.log(user);
    } else {
        console.log('An admin user with this email already exists.');
    }
};

module.exports = {
    async up(db) {
        await createAdminUser(db);
    },

    async down(db) {
        try {
            const secretsPath = path.join(process.cwd(), 'admin_secrets.json');
            const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
            const result = await db.collection('users').deleteOne({email: secrets.email});
            if (result.deletedCount === 0) {
                console.log('No user found with the provided email.');
            } else {
                console.log('User deleted successfully.');
            }
        } catch (error) {
            console.error('Error during migration down:', error);
        }
    }

};
