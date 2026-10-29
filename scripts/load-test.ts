const target = process.argv[2] ?? "http://localhost:3000";
const paths = ["/", "/menu"];
const total = Number(process.argv[3] ?? 500);
const concurrency = Number(process.argv[4] ?? 50);

function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

async function main() {
  const timings: number[] = [];
  let failures = 0;
  let next = 0;

  async function worker() {
    while (next < total) {
      const path = paths[next++ % paths.length];
      const started = performance.now();

      try {
        const response = await fetch(new URL(path, target));
        await response.arrayBuffer();
        if (!response.ok) failures += 1;
      } catch {
        failures += 1;
      }

      timings.push(performance.now() - started);
    }
  }

  const begun = performance.now();
  await Promise.all(Array.from({ length: concurrency }, worker));
  const seconds = (performance.now() - begun) / 1000;
  const sorted = [...timings].sort((a, b) => a - b);

  console.log(`Requests:     ${total} (${concurrency} at a time)`);
  console.log(`Failures:     ${failures}`);
  console.log(`Throughput:   ${(total / seconds).toFixed(1)} req/s`);
  console.log(`Median:       ${percentile(sorted, 50).toFixed(0)} ms`);
  console.log(`95th pct:     ${percentile(sorted, 95).toFixed(0)} ms`);
  console.log(`Slowest:      ${sorted[sorted.length - 1].toFixed(0)} ms`);
}

void main();
