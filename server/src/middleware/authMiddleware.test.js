import { describe, it, expect, mock, beforeEach, spyOn } from "bun:test";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "./authMiddleware.js";

mock.module("jsonwebtoken", () => {
  return {
    default: {
      verify: mock(),
    },
  };
});

mock.module("../models/User.js", () => {
  return {
    default: {
      findById: mock(),
    },
  };
});

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: mock().mockReturnThis(),
      json: mock().mockReturnThis(),
    };
    next = mock();
    process.env.JWT_SECRET = "testsecret";

    // Reset mocks
    jwt.verify.mockReset();
    User.findById.mockReset();

    spyOn(console, 'error').mockImplementation(() => {});
  });

  describe("protect", () => {
    it("should call next if token is valid and user exists", async () => {
      req.headers.authorization = "Bearer validtoken";

      jwt.verify.mockReturnValue({ id: "userId123" });

      const mockUser = { id: "userId123", email: "test@test.com" };
      User.findById.mockReturnValue({
        select: mock().mockResolvedValue(mockUser),
      });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith("validtoken", "testsecret");
      expect(User.findById).toHaveBeenCalledWith("userId123");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 401 if token is valid but user does not exist", async () => {
      req.headers.authorization = "Bearer validtoken";

      jwt.verify.mockReturnValue({ id: "userId123" });

      User.findById.mockReturnValue({
        select: mock().mockResolvedValue(null),
      });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith("validtoken", "testsecret");
      expect(User.findById).toHaveBeenCalledWith("userId123");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, user not found" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token validation fails", async () => {
      req.headers.authorization = "Bearer invalidtoken";

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith("invalidtoken", "testsecret");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, token failed" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if no token is provided", async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, no token" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if authorization header doesn't start with Bearer", async () => {
      req.headers.authorization = "Basic invalidtoken";

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Not authorized, no token" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
