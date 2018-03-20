const domain = 'https://github.com';

document.addEventListener('DOMContentLoaded', function () {

  let searchableItems;

  const search = document.getElementById('search');
  search.focus();
  search.oninput = function (event) {
    const text = event.target.value;
    const characters = text.split('');

    let results = [];

    searchableItems.forEach((item) => {
      let pointer = 0;
      let score = 0;
      let isMatching = characters.every((c) => {
        let newPointer = 0;
        newPointer = item.url.indexOf(c, pointer);
        if (newPointer < pointer) return false
        else {
          score += newPointer - pointer;
          pointer = newPointer;
          return true
        }
      });
      if (isMatching) {
        results.push({
          url: item.url.split('?')[0],
          score
        });
      }
    });
    results.sort(function(a, b) {
      return a.score - b.score;
    });
    console.log(results);
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
  };

  chrome.runtime.getBackgroundPage(function(background) {
    background.getHistory(function(items) {
      searchableItems = items
    })
  })

});
