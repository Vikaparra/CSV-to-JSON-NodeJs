const ppn = require('awesome-phonenumber').parsePhoneNumber;
const csv = require('csv-parser');
const lodash = require('lodash'); 
const fs = require('fs');
const { getgroups } = require('process');
const results = [];
let students = [];


// -------------- Catching and reading the data ----------------

fs.createReadStream('C:\\Users\\k\\Documents\\Estudos\\Programacao\\NodeJs\\CSV-to-JSON-NodeJs\\CSV-to-JSON-NodeJs\\input.csv')
  .pipe(csv({
    mapHeaders: ({ header, index }) => header == "group" ? header+index : header  // Rename 'group' columns so no information gets lost.
}))
  .on('data', (data) => results.push(data))
  .on('end', () => {

    lodash.forEach(results, fillStudents); // Reading each row
    
    let data = JSON.stringify(students);
    const escrita = fs.createWriteStream('output.json');
    escrita.write(data);
    escrita.end();
    
  });

function fillStudents(personInfo){
  var match = lodash.findIndex(students, function(o) { return o.eid == personInfo.eid;});  // This returns -1 if the student is not added yet, returns its index otherwise.

  if(match == -1){ // Case there is no existing person with the same eid
    students.push(newPerson(personInfo));
  }
  else{ // Case there is
    lodash.forEach(personInfo, function(value, key){ // Create new addresses for the person
      getAddresses(key, value, students[match]);
    })
    students[match].setGroups(personInfo);
  }
}

function newPerson (personInfo){
  // Function to create a new object of Person

    fullname = personInfo.fullname;
    eid = personInfo.eid;
    invisible = personInfo.invisible;
    see_all = personInfo.see_all;

    let person = new Person(fullname,eid,invisible,see_all, personInfo);

    lodash.forEach(personInfo, function(value, key){ // Adding the addresses  
      getAddresses(key, value, person);
    })

    getGroups(personInfo); // Adding the groups

    return person;
}

function getGroups(personInfo){
  // Function to solve the problem of duplicate 'group' columns.
  // This finds all columns that start with 'group' and sum their values into a single variable.
  // Also apply a regex match, to create a list of groups in the desired format.
  
  const sala_rx = /(([a-zA-Z0-9])+\s\d)|(([a-zA-Z0-9])+)/g; // Regex for Sala

  var keys = Object.keys(personInfo)
  var key_groups = lodash.filter(keys, function(o) {return o.slice(0, 5) == "group"})
  var groups = ''

  for(let g of key_groups){
    groups += personInfo[g] + ' '
  }
  console.log(groups.match(sala_rx));
  return groups.match(sala_rx)
}

function getAddresses(header, address, person){
  // This function get all the values (address) and keys (header) of the row
  // It splits the keys into tags using the spaces
  // If the first part of the key is phone or email, it saves the values on the Object

  let tags = [];
  tags = lodash.split(header,' '); // Separating the tags using the spaces
  if(tags[0]==="phone"){ 
    const phoneNumber = ppn.parsePhoneNumber( address, 'BR' );
    if(phoneNumber.isValid()){ 
      let newAddress = phoneNumber.getNumber( 'e164' )
      let withoutChar = lodash.trimStart(newAddress, '+'); // Removing the "+" that the parser puts by default
      let adr = new Address(tags[0], withoutChar);
      adr.setTags(lodash.drop(tags)); // The drop is being used to remove the "phone" from the tags
      person.setAddress(adr);
    }
  }
  else if (tags[0]==="email"){
    const reg = /(?:)?<?(.*?@[^>,: -)(;~]+)>?,?/g; //Regex to format the email address
    let mail;
    while (mail = reg.exec(address)) { // Executing the Regex
      let mails = [];
      mails = lodash.split(mail[1],'/'); // Cheking if there is more than 1 email address on the string 
      for(let i = 0; i < mails.length; i++){ // Saving all the email addresses
        let adr = new Address(tags[0], mails[i])
        adr.setTags(lodash.drop(tags));
        person.setAddress(adr);
      }
    }
  }
}

function toBool(param){
  // Function to turn the params into boolean values
  if((param == "yes")||(param == "1")){
    return true;
  } else if ((param == "no")||(param == "0")){
    return false;
  } else {
    return false;
  }
}

class Person {

    constructor(fullname, eid, invisible, see_all, personInfo){
        this.fullname = fullname;
        this.eid = eid;
        this.invisible = toBool(lodash.trim(invisible, ' '));
        this.see_all = toBool(lodash.trim(see_all, ' '));
        this.addresses = [];
        this.groups = lodash.uniq(getGroups(personInfo))  // Get the groups for this student and drop duplicates.
    }

    setAddress(adr){
      this.addresses.push(adr);
    }

    setGroups(personInfo){
      this.groups = lodash.uniq(lodash.concat(this.groups, getGroups(personInfo))); // Sum the lists of groups and drop duplicates.
    }

}

class Address {

    constructor(type, address){
        this.type = type;
        this.address = address;
        this.tags = [];
    }

    setTags(newTags){
        this.tags.push(newTags);
    }

}
