console.log('eventPage');

const microsecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 4;
const oneMonthAgo = (new Date).getTime() - microsecondsPerMonth;
const domain = 'https://github.com';
let historyItems;

chrome.browserAction.onClicked.addListener(function(tab) {
    console.log('clicked');
    chrome.tabs.create({ url: 'popup.html' });
});

function getHistory(callback) {
  chrome.history.search(
    {
      'text': domain,
      'startTime': oneMonthAgo,
      'maxResults': 200
    },
    function(items) {
      historyItems = items
        .filter((item) => item.url.includes(domain))
        .map((item) => {
        return {
          url: item.url.split(domain)[1],
          lastVisitTime: item.lastVisitTime,
          typedCount: item.typedCount
        }
      });
      return callback(historyItems);
    }
  );
}
