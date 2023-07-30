const defaultPermissions = {
    subscriber: {
        canViewProducts: true,
        canPurchaseProducts: true,
        canViewOrders: true,
        canCancelOrders: true,
        canViewProfile: true,
        canViewCart: true,
        canEditProfile: false
    },
    farmer: {
        canViewCrops: true,
        canAddCrops: true,
        canViewOrders: true,
        canEditCrops: true,
        canDeleteCrops: true,
        canViewProfile: true,
        canEditProfile: true
    },
    admin: {
        canViewUsers: true,
        canAddUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
        canViewProfile: true,
        canEditProfile: true,
        canViewProducts: true,
        canPurchaseProducts: true,
        canViewOrders: true,
        canCancelOrders: true,
        canViewCrops: true,
        canAddCrops: true,
        canEditCrops: true,
        canDeleteCrops: true,
        canViewDeliveries: true,
        canAcceptDeliveries: true,
        canCompleteDeliveries: true,
        canViewReports: true
    },
    carrier: {
        canViewDeliveries: true,
        canAcceptDeliveries: true,
        canCompleteDeliveries: true,
        canViewProfile: true,
        canEditProfile: false
    },
    institution: {
        canViewProducts: true,
        canPurchaseProducts: true,
        canViewOrders: true,
        canCancelOrders: true,
        canViewReports: true,
        canViewProfile: true,
        canEditProfile: false
    }
};

module.exports = defaultPermissions;
