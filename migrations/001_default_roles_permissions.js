const fs = require('fs');
const path = require('path');
const {ObjectId} = require('mongoose').Types;

const createRole = async (db, roleData) => {
    const existingRole = await db.collection('roles').findOne({name: roleData.name});
    if (existingRole) {
        console.log(`${roleData.name} role already exists.`);
        return existingRole;
    }

    try {
        const result = await db.collection('roles').insertOne(roleData);
        const insertedId = result.insertedId;
        console.log(`${roleData.name} role created successfully.`);
        return await db.collection('roles').findOne({_id: insertedId});
    } catch (error) {
        console.error(`Error creating ${roleData.name} role:`, error);
        throw error;
    }
};

const getPermissionObjectId = (insertedPermissions, action, subject) => {
    const permission = insertedPermissions.find(p => p.action === action && p.subject === subject);
    return permission ? new ObjectId(permission._id) : null;
};

module.exports = {
    async up(db) {
        const adminPermissions = [
            {
                "action": "manage",
                "subject": "all",
                "description": "Manage Everything"
            }
        ];

        const subscriberPermissions = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'subscriber.json'), 'utf-8')
        );

        // Upsert all permissions
        const allPermissions = [...adminPermissions, ...subscriberPermissions];
        const bulkOps = allPermissions.map((permission) => ({
            updateOne: {
                filter: {action: permission.action, subject: permission.subject},
                update: {$set: permission},
                upsert: true,
            },
        }));

        if (bulkOps.length > 0) {
            try {
                await db.collection("permissions").bulkWrite(bulkOps);
            } catch (error) {
                console.error("Error upserting permissions:", error);
                throw error;
            }
        }

        // Get the upserted permissions from the database
        const insertedPermissions = await db.collection('permissions').find({}).toArray();

        // Create the admin role
        await createRole(db, {
            name: 'admin',
            code: 1000,
            permissions: adminPermissions.map(p => getPermissionObjectId(insertedPermissions, p.action, p.subject)).filter(id => id),
        });

        // Create the subscriber role
        await createRole(db, {
            name: 'subscriber',
            code: 2000,
            permissions: subscriberPermissions.map(p => getPermissionObjectId(insertedPermissions, p.action, p.subject)).filter(id => id),
        });
    },

    async down(db) {
        const roles = ['admin', 'subscriber'];
        await db.collection('roles').deleteMany({name: {$in: roles}});
        await db.collection('permissions').deleteMany({});
    },
};
