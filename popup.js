//this file works with popup.html
//it receives a list of current participants from the google meet section
//it also retrieves a list of saved sections (sectionsObj) for you google account
//it compares the two and shows who is present and who is missing

//no data is stored outside of your google account


const getUsersBtn = document.querySelector('#getUsersBtn');
const studentList = document.querySelector('#studentList');
const newParticipantList = document.querySelector("#newParticipantList");
const dropDown = document.querySelector('#sectionSelect');
const takeRollBtn = document.querySelector('#takeRollBtn');
const addClassDiv = document.querySelector('#addClassDiv');
const addClassBtn = document.querySelector('#addClassBtn');
const deleteClassBtn = document.querySelector('#deleteClassBtn');
const classNameInput = document.querySelector('#classNameInput');
const alertDiv = document.querySelector('#alertDiv');
const savedListFraction = document.querySelector("#savedListFraction");
let usersHere;
let sectionsObj;

//queries the content.js script for current users in the session
const updateUsersHere = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: "send users" }, function (response) {
      console.log(response);
      usersHere = response.users;
      updateRollList();
    });
  });
}


//add all saved sections to the dropdown menu
const initDropdown = () => {
  dropDown.innerHTML = `<option value="new">Create New</option>`;
  for (let section in sectionsObj) {
    if (section !== 'selected') {
      let newOption = document.createElement('option');
      newOption.value = section;
      newOption.innerText = section;
      dropDown.append(newOption);
    }
  }
  if(sectionsObj['selected']){
    dropDown.value=sectionsObj['selected'];
    removeAlert();
  }
  if(usersHere) updateRollList();
}

//gets stored sections from chrome sync 
//A class user list is only stored in your google user account
getData = () => {
  chrome.storage.sync.get(function (result) {
    console.log('Value currently is ' + result.sectionsObj);
    sectionsObj = result;
    initDropdown();
  });
}

//save the user list for a class
//A class user list is only stored in your google user account
saveData = () => {
  chrome.storage.sync.set(sectionsObj, function () {
    console.log('Data Saved');
  });
  updateRollList();
}

//whenever you select a new section, add those students to the student list
//then color the students
const updateRollList = () => {
  console.log('updating Roll List');
  studentList.innerHTML = '';
  //if the dropdown is blank do not show anything!
  if (['None', '',].indexOf(dropDown.value) !== -1) {
    return;
  }
  //if you are creating a new class, stop here
  if (dropDown.value === 'new') {
    addAlert();
    addClassDiv.classList.remove('d-none');
    deleteClassBtn.classList.add('d-none');
    return
  }
  //Otherwise, show the participant list and list all saved participants in a class 
  else {
    addClassDiv.classList.add('d-none');
    deleteClassBtn.classList.remove('d-none');
  }
  for (let s of sectionsObj[dropDown.value]) {
    studentList.innerHTML += (`<li class="list-group-item">
    <i class="fa fa-minus-square mx-1" aria-hidden="true"></i>
    ${s}</li>`);
  }
  takeRollBtn.click();
}

//A new section has been selected by the user, update the participant list
dropDown.addEventListener('change', () => {
  console.log('dropdown changed')
  removeAlert();
  sectionsObj['selected'] = dropDown.value;
  saveData();
});

//this colors all of the users on the selected list
takeRollBtn.addEventListener('click', function () {
  let allStudents = document.querySelectorAll('li');
  //go through all of the students listed and color based
  //on whether they are here or not
  for (let s of allStudents) {
    if (usersHere.indexOf(s.innerText.trim()) !== -1) {
      //person is present
      s.classList.add('list-group-item-success');
    } else {
      //person is on roll and not present
      s.classList.add('list-group-item-danger');
    }
  }
  let newParticipants = usersHere.filter(user => sectionsObj[dropDown.value].indexOf(user) === -1)
  //new participants are here but not on the selected roll
  newParticipantList.innerHTML = '';
  console.log('new people:', newParticipants)
  //show all the new participants in blue
  for (let n of newParticipants) {
    newParticipantList.innerHTML += (`<li class="list-group-item list-group-item-primary">
    <i class="fa fa-plus-square mx-1" aria-hidden="true"></i>
    ${n}</li>`);
  }
  createManageListeners();
  countPeople();
});

// if you click on add class button, the new class will be created
// and the list of students will be refreshed
//and the data will be saved
addClassBtn.addEventListener('click', () => {
  let inputVal = classNameInput.value.trim();
  console.log('new class', inputVal);
  if (inputVal && !(inputVal in sectionsObj)) {
    sectionsObj[inputVal] = [];
    initDropdown();
    dropDown.value = inputVal;
    updateRollList();
    removeAlert();
    addClassDiv.classList.add('d-none');
    saveData();
  }
})

//When you delete a class, remove from the sections object and save data
deleteClassBtn.addEventListener('click', () => {
  let section = dropDown.value;
  chrome.storage.sync.remove(section, () => {
    getData();
  })

});

//create the + and - signs to add or delete participant from a list
const createManageListeners = () => {
  //make add icon listeners
  let addIcons = document.querySelectorAll('.fa-plus-square')

  for (let a of addIcons) {
    a.addEventListener('click', function (e) {
      console.log(e.target.parentElement);
      let section = dropDown.value;
      let person = e.target.parentElement.innerText.trim();
      sectionsObj[section].unshift(person);
      saveData();
    })
  }
  //make remove icon listeners
  let removeIcons = document.querySelectorAll('.fa-minus-square')

  for (let a of removeIcons) {
    a.addEventListener('click', function (e) {
      let section = dropDown.value;
      let person = e.target.parentElement.innerText.trim();
      let i = sectionsObj[section].indexOf(person);
      sectionsObj[section].splice(i, 1);
      saveData();
    })
  }

}
// add the class in the text field on enter.
classNameInput.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    addClassBtn.click();
  }
})

//remove the alert that tells a user how to create a section
const removeAlert = () => {
  alertDiv.classList.add('d-none');
  let listAreas = document.querySelectorAll('.list_area')
  for (let a of listAreas) {
    a.classList.remove('d-none');
  }
}

//show the alert that tells a user how to create a section
const addAlert = () => {
  alertDiv.classList.remove('d-none');
  let listAreas = document.querySelectorAll('.list_area')
  for (let a of listAreas) {
    a.classList.add('d-none');
  }
}

//count the number present vs total users to get a fraction of users present
const countPeople = () => {
  savedListFraction.innerText = '';
  let here = document.querySelectorAll('.list-group-item-success').length;
  console.log(here);
  let missing = document.querySelectorAll('.list-group-item-danger').length;
  savedListFraction.innerText += ' ' + here + '/' + (here + missing);

}


// while the popup is open, update the user list periodically
setInterval(() => {
  updateUsersHere();
}, 4000);

//wait 300 ms to get the first list of users
setTimeout(()=>{
  updateUsersHere();
},300)

// get the saved data from google upon opening popup.html
getData();

