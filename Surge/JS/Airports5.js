(async () => {
  let args = getArgs();
  let info = await getDataInfo(args.url);
  if (!info) $done();
  let resetDayLeft = getRmainingDays(parseInt(args["reset_day"]));

  let used = info.download + info.upload;
  let total = info.total;
  let proportion = used / total;
  let expire = args.expire || info.expire;
  let usedsize = used / 1073741824;
  let usedsizeGB = usedsize.toFixed(2)
  let totalsize = total / 1073741824;
  let totalsizeGB = totalsize.toFixed(0)
  /*
  let content = [`Used: ${toPercent(proportion)}, ${usedsizeGB} GB, Total: ${totalsizeGB} GB`];
  */
  //let content = [`Used: ${usedsizeGB} GB. Total: ${totalsizeGB} GB`];
  let content = [`𝘙𝘦𝘴𝘦𝘵 : ${resetDayLeft} days | 𝘌𝘹𝘱 : ${expire} | 150G`];

  let now = new Date();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  hour = hour > 9 ? hour : "0" + hour;
  minutes = minutes > 9 ? minutes : "0" + minutes;

  $done({
    //title: `𝗙𝗹𝗼𝘄𝗲𝗿 | 𝘙𝘦𝘴𝘦𝘵 : ${resetDayLeft} d | 𝘌𝘹𝘱 : 2022/7/12`,
    title: `𝗙𝗹𝗼𝘄𝗲𝗿 | 𝘜𝘴𝘢𝘨𝘦 : ${usedsizeGB} GB, ${toPercent(proportion)}`,
    content: content.join("\n"),
  });
})();

function getArgs() {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

function getUserInfo(url) {
  let request = { headers: { "User-Agent": "Clash" }, url };
  return new Promise((resolve, reject) =>
    $httpClient.get(request, (err, resp) => {
      if (err != null) {
        reject(err);
        return;
      }
      if (resp.status !== 200) {
        reject(resp.status);
        return;
      }
      let header = Object.keys(resp.headers).find(
        (key) => key.toLowerCase() === "subscription-userinfo"
      );
      if (header) {
        resolve(resp.headers[header]);
        return;
      }
      reject("链接响应头不带有流量信息");
    })
  );
}

async function getDataInfo(url) {
  const [err, data] = await getUserInfo(url)
    .then((data) => [null, data])
    .catch((err) => [err, null]);
  if (err) {
    console.log(err);
    return;
  }

  return Object.fromEntries(
    data
      .match(/\w+=[\d.eE+]+/g)
      .map((item) => item.split("="))
      .map(([k, v]) => [k, Number(v)])
  );
}

function getRmainingDays(resetDay) {
  if (!resetDay) return;

  let now = new Date();
  let today = now.getDate();
  let month = now.getMonth();
  let year = now.getFullYear();
  let daysInMonth;

  if (resetDay > today) {
    daysInMonth = 0;
  } else {
    daysInMonth = new Date(year, month + 1, 0).getDate();
  }

  return daysInMonth - today + resetDay;
}

function bytesToSize(bytes) {
  if (bytes === 0) return "0B";
  let k = 1024;
  sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}

function formatTime(time) {
  let dateObj = new Date(time);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  return year + "/" + month + "/" + day;
}

function toPercent(proportion) {
  const percent = Number(proportion*100).toFixed(1);
  return `${percent}%`
}

