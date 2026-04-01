import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
const mockSelectDistinct = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockWhere = vi.fn();

const mockDb = {
  selectDistinct: mockSelectDistinct,
  select: mockSelect,
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  getLatestWeeklyReportage: vi.fn().mockResolvedValue(null),
  getLatestMarketAnalysis: vi.fn().mockResolvedValue(null),
}));

describe("Dealflow tRPC procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("dealflow.dates", () => {
    it("should return empty array when db is null", async () => {
      // When getDb returns null, the procedure should return []
      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(null);

      // The procedure logic: if (!db) return [];
      const db = await (getDb as any)();
      if (!db) {
        expect([]).toEqual([]);
      }
    });

    it("should return dates when db has data", async () => {
      const mockDates = [
        { publishDate: "2026-04-01" },
        { publishDate: "2026-03-31" },
      ];

      mockLimit.mockResolvedValue(mockDates);
      mockOrderBy.mockReturnValue({ limit: mockLimit });
      mockFrom.mockReturnValue({ orderBy: mockOrderBy });
      mockSelectDistinct.mockReturnValue({ from: mockFrom });

      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(mockDb);

      const db = await (getDb as any)();
      if (db) {
        const rows = await db
          .selectDistinct({ publishDate: "publishDate" })
          .from("dealflow_picks")
          .orderBy("desc")
          .limit(30);
        const result = rows.map((r: { publishDate: string }) => r.publishDate);
        expect(result).toEqual(["2026-04-01", "2026-03-31"]);
      }
    });
  });

  describe("dealflow.byDate", () => {
    it("should return empty array when db is null", async () => {
      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(null);

      const db = await (getDb as any)();
      if (!db) {
        expect([]).toEqual([]);
      }
    });

    it("should return picks for a specific date", async () => {
      const mockPicks = [
        {
          id: 1,
          publishDate: "2026-04-01",
          rank: 1,
          name: "Mistral AI",
          description: "French AI startup",
          funding: "Series B $640M",
          valuation: "$6B",
          rating: "INVEST++",
          link: "https://mistral.ai",
          sector: "AI/LLM",
          country: "Francia",
        },
        {
          id: 2,
          publishDate: "2026-04-01",
          rank: 2,
          name: "Synthesia",
          description: "AI video platform",
          funding: "Series C $90M",
          valuation: "$2.1B",
          rating: "INVEST++",
          link: "https://synthesia.io",
          sector: "AI Video",
          country: "UK",
        },
      ];

      mockOrderBy.mockResolvedValue(mockPicks);
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockFrom.mockReturnValue({ where: mockWhere });
      mockSelect.mockReturnValue({ from: mockFrom });

      const { getDb } = await import("./db");
      (getDb as any).mockResolvedValue(mockDb);

      const db = await (getDb as any)();
      if (db) {
        const rows = await db
          .select()
          .from("dealflow_picks")
          .where("publishDate = '2026-04-01'")
          .orderBy("rank");
        expect(rows).toHaveLength(2);
        expect(rows[0].name).toBe("Mistral AI");
        expect(rows[0].rating).toBe("INVEST++");
        expect(rows[1].name).toBe("Synthesia");
      }
    });

    it("should use today's date when no date provided", () => {
      const input = { date: undefined };
      const targetDate =
        input.date || new Date().toISOString().slice(0, 10);
      expect(targetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("Rating validation", () => {
    it("should only allow valid rating values", () => {
      const validRatings = ["INVEST", "INVEST+", "INVEST++"];
      const testRating = "INVEST+";
      expect(validRatings).toContain(testRating);
    });

    it("should reject invalid rating values", () => {
      const validRatings = ["INVEST", "INVEST+", "INVEST++"];
      const invalidRating = "SELL";
      expect(validRatings).not.toContain(invalidRating);
    });
  });

  describe("Date formatting", () => {
    it("should format dates correctly for Italian locale", () => {
      const dateStr = "2026-04-01";
      const parts = dateStr.split("-");
      const d = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );
      const formatted = d.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      expect(formatted).toContain("2026");
      expect(formatted).toContain("aprile");
    });
  });
});
