// One password rule for sign-up, change password and reset. It mirrors the server's
// (validator.isStrongPassword defaults): 8+ characters with lowercase, uppercase, number and symbol.
export const PASSWORD_PATTERN = "(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}";
export const PASSWORD_HINT = "8 or more characters, with an uppercase letter, a lowercase letter, a number and a symbol such as ! or @.";
export const isStrongPassword = (value) => new RegExp(`^${PASSWORD_PATTERN}$`).test(String(value || ""));
