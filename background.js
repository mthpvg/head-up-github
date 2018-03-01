// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
var microsecondsPerMonth = 1000 * 60 * 60 * 24 * 7 * 4;
var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
var oneMonthAgo = (new Date).getTime() - microsecondsPerMonth;

const domain = 'https://github.com';

let historyItems;

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
    console.log('history items:', historyItems);
  }
);


let bookmarkItems;

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
  console.log('bookmarks items:', bookmarkItems);
});

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    const fragments = text.split(' ')

    const characters = text.split('');

    console.log('********\n\n', characters);

    const results = [];

    const items = historyItems.concat(bookmarkItems);

    console.log(items);


    items.forEach((item) => {
      // console.log({item});
      let pointer = 0;
      let score = 0;
      let isMatching = characters.every((c) => {
        let newPointer = 0;
        if (c === ' ') {
          newPointer = item.url.indexOf('/', pointer);
        } else {
          newPointer = item.url.indexOf(c, pointer);
        }
        if (newPointer < pointer) return false
        else {
          if (c !== ' ') {
            score += newPointer - pointer;
          }
          pointer = newPointer;
          return true
        }
      });
      if (isMatching) {
        results.push({
          url: domain + item.url.split('?')[0],
          score
        });
      }
    });


    results.sort(function(a, b) {
      return a.score - b.score;
    });

    console.log(results);

    var urls = [];
    for (var i = 0; i < results.length; ++i) {
      urls.push({
        content: results[i].url, description: results[i].url
      })
    }

    suggest(urls);

  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    navigate(text);
  }
);

function navigate(url) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
  });
}
