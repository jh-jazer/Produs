import { test, expect, mock, describe, beforeEach } from "bun:test";

// Mock jsonwebtoken
mock.module("jsonwebtoken", () => ({
  default: {
    verify: (token, secret) => {
      if (token === "valid-token") return { id: "user-123" };
      if (token === "no-user-token") return { id: "non-existent-id" };
      throw new Error("Invalid token");
    }
  }
}));

// Mock User model
mock.module("../models/User.js", () => ({
  default: {
    findById: (id) => ({
      select: () => {
        if (id === "user-123") return { _id: "user-123", email: "test@example.com" };
        if (id === "admin-user-id") return { _id: "admin-user-id", email: "ernestodesabillejr@gmail.com" };
        return null;
      }
    })
  }
}));

import { protect, adminOnly, optionalProtect } from "./authMiddleware.js";

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.jsonData = data;
        return this;
      }
    };
    next = mock(() => {});
  });

  describe("protect", () => {
    test("should call next() when valid token is provided", async () => {
      req.headers.authorization = "Bearer valid-token";
      await protect(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user._id).toBe("user-123");
    });

    test("should return 401 when token verification fails", async () => {
      req.headers.authorization = "Bearer invalid-token";
      await protect(req, res, next);
      expect(res.statusCode).toBe(401);
      expect(res.jsonData.message).toBe("Not authorized, token failed");
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 when user is not found in database", async () => {
      req.headers.authorization = "Bearer no-user-token";
      await protect(req, res, next);
      expect(res.statusCode).toBe(401);
      expect(res.jsonData.message).toBe("Not authorized, user not found");
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 when no token is provided", async () => {
      await protect(req, res, next);
      expect(res.statusCode).toBe(401);
      expect(res.jsonData.message).toBe("Not authorized, no token");
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("adminOnly", () => {
    test("should call next() when user is the admin", () => {
      req.user = { email: "ernestodesabillejr@gmail.com" };
      adminOnly(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    test("should return 403 when user is not the admin", () => {
      req.user = { email: "regular@example.com" };
      adminOnly(req, res, next);
      expect(res.statusCode).toBe(403);
      expect(res.jsonData.message).toBe("Forbidden: Admin access only");
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 403 when req.user is missing", () => {
      adminOnly(req, res, next);
      expect(res.statusCode).toBe(403);
      expect(res.jsonData.message).toBe("Forbidden: Admin access only");
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("optionalProtect", () => {
    test("should set req.user and call next() with valid token", async () => {
      req.headers.authorization = "Bearer valid-token";
      await optionalProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user._id).toBe("user-123");
    });

    test("should call next() and not fail when token is invalid", async () => {
      req.headers.authorization = "Bearer invalid-token";
      await optionalProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      // req.user remains undefined or unchanged
    });

    test("should set req.user to null and call next() when user not found", async () => {
      req.headers.authorization = "Bearer no-user-token";
      await optionalProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeNull();
    });

    test("should call next() when no token provided", async () => {
      await optionalProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });
});
