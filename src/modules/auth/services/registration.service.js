export const signup = (req, res, next) => {
  const { username, email, password, confirmationPassword } = req.body;
  const data = { username, email, password };
  return res.status(200).json({ message: "Signup" });
};
