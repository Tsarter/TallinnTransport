const puppeteer = require("puppeteer");
const fs = require("fs");
const { exec } = require("child_process");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const imageFolder =
    "C:/Users/Tanel/Documents/AA_PROJECTS/AA TalTech stuff/Bakatoo/iaib/node/gif_maker_for/images";

  // Ensure the images directory exists
  if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(imageFolder, { recursive: true });
  }
  const datetime = "2025-04-04 15:00:00";

  const parnuMnt = "&mapCenterLat=59.415675&mapCenterLng=24.739344&mapZoom=15";
  const kristiineKolmnurk =
    "&mapCenterLat=59.431262&mapCenterLng=24.716985&mapZoom=15";
  const nommeRist = "&mapCenterLat=59.388894&mapCenterLng=24.678705&mapZoom=15";
  // Ensure the images directory exists
  let baseUrl = `http://192.168.1.2/speeds_by_segments/segment_speeds.html?line=&type=2&disStops=`;
  baseUrl += nommeRist;
  baseUrl += `&maxSpeed=10`;
  baseUrl += `&cleanUi=true`;
  const minuteStep = 20; // 5 minutes
  const startHour = 5;
  const endHour = 22;
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += minuteStep) {
      const startTime = new Date(datetime);
      startTime.setHours(hour, minute, 0, 0);
      startTime.setTime(startTime.getTime() + 3 * 60 * 60 * 1000); // Adjust for Estonian timezone (UTC+3)
      const endTime = new Date(datetime);
      endTime.setHours(hour, minute + minuteStep, 0, 0);
      endTime.setTime(endTime.getTime() + 3 * 60 * 60 * 1000); // Adjust for Estonian timezone (UTC+3)
      const formattedStartTime = startTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const formattedEndTime = endTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const url = `${baseUrl}&startTime=${formattedStartTime}&endTime=${formattedEndTime}`;

      console.log(`Navigating to: ${url}`);
      await page.goto(url, { waitUntil: "networkidle0" });
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            if (document.readyState === "complete") {
              resolve();
            } else {
              window.addEventListener("load", resolve);
            }
          })
      );
      await page.screenshot({
        path: `${imageFolder}/${hour}_${minute}.png`,
      });
      // wait for 1 second before taking the next screenshot
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  await browser.close();

  // Generate GIF using ImageMagick
  /* exec(
    "magick -delay 100 -loop 0 *.png output.gif",
    (err) => {
      if (err) console.error("GIF generation error:", err);
      else console.log("GIF created as output.gif");
    }
  ); */
})();
