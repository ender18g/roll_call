const sectionsObj = {
  Example_Class: [
    "Jane Doe",
    "John Smith",
    "Blue = New",
    "Green = Present",
    "Red = Absent"
  ]
}


//store some data after install
chrome.runtime.onInstalled.addListener(function () {

  chrome.storage.sync.set(sectionsObj, function () {
    console.log('initial data sync');
  });

  //Color icon when going to meet.google.com
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostEquals: 'meet.google.com' },
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

