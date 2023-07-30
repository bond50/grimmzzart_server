exports.formatPhoneNumber = phone => {
  if (phone[0] === '0') {
    return '254' + phone.slice(1);
  }
  if (phone[0] === '+') {
    return phone.slice(1);
  }
  return phone;
};