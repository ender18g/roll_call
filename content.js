//this script is executed inside the Google Meet Browser
// if your popup.js asks for the present users, it looks at the users,
// makes an array, and sends a message back with the current users.

console.log('content.js loaded!!!!')

let jumbo_meeting = false;

//this clicks on the user tab, finds all applicable divs, and returns user names
const getUsers = ()=>{
  
  return new Promise(resolve=>{
    //selects all divs where innertext is username
    const showBtn = document.querySelector("div[data-tooltip='Show everyone']")
    if(showBtn){
      //zoom out so we can see more users
      if(jumbo_meeting){
        document.body.style.zoom='50%';
      }
      showBtn.click();
    }else resolve [null];
    /// wait for the userlist to appear before trying to get users
    setTimeout(()=>{
      const alldivs = document.querySelectorAll("div[data-participant-id]");
      jumbo_meeting = alldivs.length>12 ? true : false;
      if(!alldivs) resolve([null]);
      let users=[];
      for(let d of alldivs){
        let name = d.children[0].children[1].children[0].innerText;
          users.push(name);
      }
      console.log(users);
      //set zoom back to 100%
      document.body.style.zoom='100%';
      resolve(users);
    },200);
  });
}

//if you get a message asking to send users, return users present
//this message is sent to the popup.html / popup.js file on the user's toolbar
chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "send users"){
      //if popup.js is asking for users, send the userList array
     getUsers().then((userList)=>{
        sendResponse({users:userList});
     });
    }
  return true;
  });

