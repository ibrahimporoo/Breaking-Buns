import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  getZonedParts,
  isIsoDate,
  minutesToTime,
  timeToMinutes,
  weekdayOf,
  zonedTimeToUtc,
} from "@/lib/time";

const NEW_YORK = "America/New_York";

describe("zonedTimeToUtc", () => {
  it("converts winter wall time (EST, UTC-5)", () => {
    assert.equal(
      zonedTimeToUtc("2026-01-15", "12:00", NEW_YORK).toISOString(),
      "2026-01-15T17:00:00.000Z",
    );
  });

  it("converts summer wall time (EDT, UTC-4)", () => {
    assert.equal(
      zonedTimeToUtc("2026-07-01", "12:00", NEW_YORK).toISOString(),
      "2026-07-01T16:00:00.000Z",
    );
  });

  it("handles the spring-forward day (2026-03-08)", () => {
    assert.equal(
      zonedTimeToUtc("2026-03-08", "12:00", NEW_YORK).toISOString(),
      "2026-03-08T16:00:00.000Z",
    );
    assert.equal(
      zonedTimeToUtc("2026-03-08", "00:00", NEW_YORK).toISOString(),
      "2026-03-08T05:00:00.000Z",
    );
  });

  it("handles the fall-back day (2026-11-01)", () => {
    assert.equal(
      zonedTimeToUtc("2026-11-01", "12:00", NEW_YORK).toISOString(),
      "2026-11-01T17:00:00.000Z",
    );
  });

  it("works for zones east of UTC", () => {
    assert.equal(
      zonedTimeToUtc("2026-10-25", "20:00", "Europe/Berlin").toISOString(),
      "2026-10-25T19:00:00.000Z",
    );
  });
});

describe("getZonedParts", () => {
  it("reads the local date, time and weekday", () => {
    const parts = getZonedParts(new Date("2026-10-26T03:30:00Z"), NEW_YORK);
    assert.deepEqual(parts, { date: "2026-10-25", time: "23:30", weekday: 0 });
  });

  it("round-trips with zonedTimeToUtc", () => {
    const instant = zonedTimeToUtc("2026-12-24", "19:30", NEW_YORK);
    const parts = getZonedParts(instant, NEW_YORK);
    assert.equal(parts.date, "2026-12-24");
    assert.equal(parts.time, "19:30");
  });
});

describe("date helpers", () => {
  it("adds days across month and year boundaries", () => {
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  });

  it("finds weekdays (0 = Sunday)", () => {
    assert.equal(weekdayOf("2026-10-25"), 0);
    assert.equal(weekdayOf("2026-10-26"), 1);
  });

  it("validates ISO dates", () => {
    assert.equal(isIsoDate("2026-02-30"), false);
    assert.equal(isIsoDate("2026-2-3"), false);
    assert.equal(isIsoDate("2026-10-25"), true);
  });

  it("converts between minutes and HH:mm", () => {
    assert.equal(timeToMinutes("23:30"), 1410);
    assert.equal(minutesToTime(750), "12:30");
  });
});
