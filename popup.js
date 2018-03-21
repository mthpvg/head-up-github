const domain = 'https://github.com';

document.addEventListener('DOMContentLoaded', function () {

  let searchableItems1;
  let searchableItems2;

  const search = document.getElementById('search');
  search.focus();
  let results = [];

  search.oninput = function (event) {
    const text = event.target.value;
    const characters = text.split('');
    const fragments = text.split(' ');

    if (fragments.length > 1) {
      const firstResult = results.shift();
      results.unshift(
        {
          url: `${firstResult.url}/pulls`,
          score: 0
        }
      )
      results.unshift(
        {
          url: `${firstResult.url}/releases`,
          score: 0
        }
      )
      results.unshift(
        {
          url: `${firstResult.url}/branches`,
          score: 0
        }
      )
      results.unshift(
        {
          url: `${firstResult.url}/pulls?q=is%3Apr+is%3Aclosed`,
          score: 0
        }
      )
      results.unshift(
        {
          url: `${firstResult.url}`,
          score: 0
        }
      )
      show(results);
      return
    }


    const searchableItems = searchableItems1.concat(searchableItems2)

    const cleanedItems = searchableItems
      .filter((item) => {
        return item.url.split('/').length > 2
      })
      .map(item => item.url.split('?')[0])
      .map((item) => {
        const frags = item.split('/');
        return `/${frags[1]}/${frags[2]}`
      })

    const uniqueItems = [...new Set(cleanedItems)]

    results = [];

    uniqueItems.forEach((item) => {
      let pointer = 0;
      let score = 0;
      let isMatching = characters.every((c) => {
        let newPointer = 0;
        if (c === ' ') return true
        newPointer = item.indexOf(c, pointer);
        if (newPointer < pointer) return false
        else {
          score += newPointer - pointer;
          pointer = newPointer;
          return true
        }
      });
      if (isMatching) {
        results.push({
          url: item,
          score
        });
      }
    });
    results.sort(function(a, b) {
      return a.score - b.score;
    });
    show(results);

  };

  chrome.runtime.getBackgroundPage(function(background) {
    background.getHistory(function(items) {
      searchableItems1 = items
    })
  })

  chrome.runtime.getBackgroundPage(function(background) {
    background.getBookmarks(function(items) {
      searchableItems2 = items
    })
  })

});

function show(results) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  results.forEach((result, index) => {
    const par = document.createElement('div');
    var newNode = document.createElement('a');
    newNode.href = `${domain}/${result.url}`
    newNode.innerHTML = `${index} ${result.url} ${result.score}`;
    par.appendChild(newNode)
    resultDiv.appendChild(par);
  });
}
