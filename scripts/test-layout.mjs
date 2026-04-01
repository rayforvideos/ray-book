import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";

const pages = [
  { name: "홈", path: "/" },
  { name: "시리즈 목록", path: "/series" },
  { name: "콜백 (시각화 없음)", path: "/posts/callbacks" },
  { name: "실행 컨텍스트 (시각화 있음)", path: "/posts/what-is-execution-context" },
  { name: "이벤트 루프 (시각화 있음)", path: "/posts/event-loop" },
  { name: "스코프 체인 (시각화 있음)", path: "/posts/scope-and-scope-chain" },
  { name: "검색", path: "/search" },
];

async function measure() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("페이지별 헤더 위치 및 body 너비 측정\n");
  console.log("%-35s  %-12s  %-12s  %-12s  %-12s", "페이지", "body.scrollW", "header.left", "header.width", "main.left");
  console.log("-".repeat(90));

  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 500));

    const result = await page.evaluate(() => {
      const body = document.body;
      const header = document.querySelector("header > div");
      const main = document.querySelector("main");

      const headerRect = header?.getBoundingClientRect();
      const mainRect = main?.getBoundingClientRect();

      return {
        bodyScrollWidth: body.scrollWidth,
        bodyClientWidth: body.clientWidth,
        headerLeft: headerRect?.left,
        headerWidth: headerRect?.width,
        mainLeft: mainRect?.left,
        mainWidth: mainRect?.width,
      };
    });

    console.log(
      "%-35s  %-12s  %-12s  %-12s  %-12s",
      p.name,
      `${result.bodyScrollWidth} (${result.bodyClientWidth})`,
      result.headerLeft?.toFixed(1),
      result.headerWidth?.toFixed(1),
      result.mainLeft?.toFixed(1)
    );
  }

  await browser.close();
}

measure().catch(console.error);
