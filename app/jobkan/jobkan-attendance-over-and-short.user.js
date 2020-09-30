// ==UserScript==
// @name         ジョブカン出勤簿　過不足自動計算
// @version      0.1
// @description  月末に向けた稼働時間を調整しやすいように、休暇を含めた過不足を自動計算します。
// @match        https://ssl.jobcan.jp/employee/attendance
// ==/UserScript==

(function () {
    'use strict';

    // h:m のような勤務時間を分に変換
    function timeToMinutes(time) {
        const sign = time.startsWith("-") ? -1 : 1;
        const [minute, hour] = time.match(/^-?(\d+):(\d+)$/).reverse();
        const minutes = sign * (parseInt(hour, 10) * 60 + parseInt(minute, 10));
        return minutes;
    }

    // 1.00 のような休暇など取得日数を分に変換
    function daysToMinutes(days) {
        const number = parseFloat(days, 10);
        const minutes = number * 8 * 60; // 1.0 日を8時間とみなす
        return minutes;
    }

    // 所定過不足累計: おそらく月初から当日までと思われるので、これを使う
    const laborHoursMinutes = timeToMinutes(document.querySelector("#search-result > div.infotpl > table:nth-child(3) > tbody > tr:nth-child(14) > td").innerText);

    // 各種休暇すべて合計
    const holidaysMinutes = Array
        .from(document.querySelectorAll("#search-result > div.infotpl > table:nth-child(4) > tbody:nth-child(4) > tr > td"))
        .map(e => daysToMinutes(e.innerText))
        .reduce((minute, sum) => minute + sum, 0);

    const overAndShorts = laborHoursMinutes + holidaysMinutes;

    const messageBar = document.createElement("span")
    messageBar.innerText = overAndShorts >= 0
        ? `今日まで: ${overAndShorts}分 残業してます`
        : `今日まで: ${overAndShorts}分 不足してるようです`;
    messageBar.style = `
       font-size: 50px;
       color: rgb(240, 240, 240);
       background: rgba(30, 30, 30, 0.75);
       display: block;
       width: 100%;
       position: fixed;
       bottom: 0;
       z-index: 99999;
    `;
    document.body.appendChild(messageBar);
})();
