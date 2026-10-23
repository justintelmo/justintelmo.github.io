// The resume has a phone number on it. Drafting copy from it makes a leak easy, so scan for one.
export const PHONE = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
