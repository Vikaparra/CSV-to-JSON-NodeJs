const ppn = require("awesome-phonenumber").parsePhoneNumber;
const csv = require("csv-parser");
const lodash = require("lodash");
const fs = require("fs");
const validator = require("email-validator");
const students = [];

// -------------- Catching and reading the data ----------------

console.log("----------------------");
console.log("Starting program, reading 'input.csv'");

fs.createReadStream("input.csv") // Parsing the CSV
  .pipe(
    csv({
      mapHeaders: ({ header, index }) =>
        header == "group" ? header + index : header, // Rename 'group' columns so no information gets lost.
    })
  )
  .on("data", (data) => fillStudents(data)) // For every row
  .on("end", () => {
    const data = JSON.stringify(students);
    console.log("----------------------");
    console.log("Writing data in output.json");
    const writing = fs.createWriteStream("output.json");
    writing.write(data);
    writing.end();
    console.log("----------------------");
    console.log("Program finished");
  });

function fillStudents(personInfo) {
  // This function will fill the students array
  // Case there's a student with an already existing eid, it will create new addresses and add the new groups for the already registered one

  const match = lodash.findIndex(students, function (o) {
    return o.eid == personInfo.eid;
  }); // This returns -1 if the student is not added yet, returns its index otherwise.

  if (match == -1) {
    // Case there is no existing person with the same eid
    console.log("----------------------");
    console.log("Adding new student");
    students.push(newPerson(personInfo));
  } else {
    // Case there is
    console.log("----------------------");
    console.log("Adding info to already existent student, eid: ", personInfo.eid, "/ Name: ", personInfo.fullname);
    lodash.forEach(personInfo, function (value, key) {
      getAddresses(key, value, students[match]);
    });
    students[match].setGroups(personInfo);
  }
}

function newPerson(personInfo) {
  // This function will create a new object of Person using the data received from the parser

  const person = new Person(personInfo);

  lodash.forEach(personInfo, function (value, key) {
    // Adding the addresses
    getAddresses(key, value, person);
  });

  return person;
}

function getGroups(personInfo) {
  // Function to solve the problem of duplicate 'group' columns.
  // This finds all columns that start with 'group' and sum their values into a single variable.
  // Also apply a regex match, to create a list of groups in the desired format.

  const sala_rx =
    /((Classe \d*)|(Sala \d*)|(Turma \d*)|(Noturno)|(Diurno)|(Integral))/g; // Regex for Sala

  const keys = Object.keys(personInfo);
  let key_groups = lodash.filter(keys, function (o) {
    return o.slice(0, 5) == "group";
  });
  let groups = "";

  for (let g of key_groups) {
    groups += personInfo[g] + " "; // Adding the values from each 'group' column to an variable
  }
  return groups.match(sala_rx);
}

function getAddresses(header, address, person) {
  // This function get all the values (address) and keys (header) of the row
  // It splits the keys into tags using the spaces
  // If the first part of the key is phone or email, it saves the values on an Address object in the respective Person object of the student

  let tags = [];
  tags = lodash.split(header, " "); // Separating the tags using the spaces

  if (tags[0] === "phone") {
    const phoneNumber = ppn.parsePhoneNumber(address, "BR");
    if ((address == null) | (address == "")) {
      console.log("----------------------");
      console.log("Null phone number from person:", person.fullname, "/ Tag: ", lodash.drop(tags));
    } else {
      if (phoneNumber.isValid()) {
        const newAddress = phoneNumber.getNumber("e164");
        const withoutChar = lodash.trimStart(newAddress, "+"); // Removing the "+" that the parser puts by default
        const adr = new Address(tags[0], withoutChar);
        adr.setTags(lodash.drop(tags)); // The "lodash.drop" is being used to remove the "phone" from the tags
        person.setAddress(adr);
      } else {
        console.log("----------------------");
        console.log("Invalid phone number:", address, "/ From person:", person.fullname, "/ Tag: ", lodash.drop(tags));
      }
    }
  } else if (tags[0] === "email") {
    const email_reg = /[A-Z0-9%+@._-]+/gi; //Regex to remove caracters that are not valid for emails like "/" or ":"
    let emails = address.match(email_reg);

    if (emails == null) {
      console.log("----------------------");
      console.log("Null email from person:", person.fullname, "/ Tag: ", lodash.drop(tags));
    } else {
      for (let e of emails) {
        // Saving all the email addresses
        if (validator.validate(e)) {
          const adr = new Address(tags[0], e);
          adr.setTags(lodash.drop(tags));
          person.setAddress(adr);
        } else {
          console.log("----------------------");
          console.log("Invalid email address:", e, "/ From person:", person.fullname, "/ Tag: ", lodash.drop(tags));
        }
      }
    }
  }
}

function toBool(param) {
  // Function to turn the params into boolean values

  if (param == "yes" || param == "1") {
    return true;
  } else if (param == "no" || param == "0") {
    return false;
  } else {
    return false;
  }
}

// -------------------- Data Structures ------------------------

class Person {
  // This class will store the information of each registered student
  // There will be one object of Person to each unique eid present on the CSV

  constructor(personInfo) {
    this.fullname = personInfo.fullname;
    this.eid = personInfo.eid;
    this.invisible = toBool(lodash.trim(personInfo.invisible, " "));
    this.see_all = toBool(lodash.trim(personInfo.see_all, " "));
    this.addresses = [];
    this.groups = lodash.uniq(getGroups(personInfo)); // Get the groups for this student and drop duplicates.
  }

  setAddress(adr) {
    this.addresses.push(adr);
  }

  setGroups(personInfo) {
    this.groups = lodash.uniq(
      lodash.concat(this.groups, getGroups(personInfo))
    ); // Sum the lists of groups and drop duplicates.
  }
}

class Address {
  // This class will store every address of a person (email or phone)
  // There will be one object of Address to each phone or email present on the CSV
  // The CSV headers will be separated, the first part will be the "type" and the following ones the "tags"

  constructor(type, address) {
    this.type = type;
    this.address = address;
    this.tags = [];
  }

  setTags(newTags) {
    this.tags.push(newTags);
  }
}
