export default function handler(_req: unknown, res: { statusCode: number; setHeader(name: string, value: string): void; end(body: string): void }) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: "Not found" }));
}
