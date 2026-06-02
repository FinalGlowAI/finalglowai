import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple classes", () => {
    expect(cn("flex", "gap-2", "p-4")).toBe("flex gap-2 p-4");
  });

  it("resolves tailwind conflicts — last class wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("ignores falsy values", () => {
    expect(cn("flex", false, null, undefined, "gap-2")).toBe("flex gap-2");
  });

  it("handles conditional objects", () => {
    expect(cn({ "font-bold": true, "font-thin": false })).toBe("font-bold");
  });

  it("combines conditional objects with plain strings", () => {
    const isActive = true;
    expect(cn("btn", { "btn-active": isActive, "btn-disabled": false })).toBe("btn btn-active");
  });

  it("returns empty string when all values are falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("handles an empty call", () => {
    expect(cn()).toBe("");
  });

  it("merges conflicting background colors — last wins", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("handles arrays of classes", () => {
    expect(cn(["flex", "items-center"], "gap-4")).toBe("flex items-center gap-4");
  });
});
