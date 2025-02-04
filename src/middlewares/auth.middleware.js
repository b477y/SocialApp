import { asyncHandler } from "../utils/response/error.response.js";
import { decodeToken, tokenTypes } from "../utils/security/token.security.js";

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return next(
        new Error("Authorization header is required", { cause: 401 })
      );
    }
    req.user = await decodeToken({
      authorization,
      tokenType: tokenTypes.access,
      next,
    });
    return next();
  });
};

export const authorization = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Unauthorized user", { cause: 403 }));
    }

    req.user = await decodeToken({
      authorization: req.headers.authorization,
      next,
    });
    return next();
  });
};
