// permissionsGenerator.js
function generatePermissions(subjects, actions) {
  let permissions = [];

  subjects.forEach((subject) => {
    actions.forEach((action) => {
      let permission = { subject: subject.name, action: action.name };

      if (action.own) {
        permission.own = action.own;
      }

      if (action.fields) {
        permission.fields = action.fields;
      }

      permissions.push(permission);
    });
  });

  return permissions;
}

module.exports = generatePermissions;
