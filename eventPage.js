console.log('eventPage');

const microsecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 4;
const sixMonthsAgo = (new Date).getTime() - 6 * microsecondsPerMonth;
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
      'startTime': sixMonthsAgo,
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

function getBookmarks(callback) {
  chrome.bookmarks.search(domain, function(items) {
    bookmarkItems = items
      .filter((item) => item.url.includes(domain))
      .map((item) => {
      return {
        url: item.url.split(domain)[1],
        lastVisitTime: item.dateAdded,
        typedCount: 100
      }
    });
    callback(bookmarkItems)
  });
}
