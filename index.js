const ppn = require('awesome-phonenumber').parsePhoneNumber;
const csv = require('csv-parser');
let lodash = require('lodash'); 
const fs = require('fs');
const { parse } = require('path');
const { forEach } = require('lodash');
const results = [];


// -------------- pegando dados ----------------

fs.createReadStream('C:\\Users\\k\\Documents\\Estudos\\Programacao\\NodeJs\\CSV-to-JSON-NodeJs\\CSV-to-JSON-NodeJs\\input.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {

    let pessoas = [];
    pessoas = lodash.map(results, newPerson);

    let data = JSON.stringify(pessoas);
    console.log(data);

      const escrita = fs.createWriteStream('output.json');
      escrita.write(data);
      escrita.end();
    
  });

  function newPerson (person){
      fullname = person.fullname;
      eid = person.eid;
      invisible = person.invisible;
      see_all = person.see_all;

      let pessoa = new Pessoa(fullname,eid,invisible,see_all);

      lodash.forEach(person, function(value, key){
        pessoa.setAddresses(key, value);
      })

      return pessoa;
  }


// ---------------- estruturas ------------------


class Pessoa {

    constructor(fullname, eid, invisible, see_all){
        this.fullname = fullname;
        this.eid = eid;
        this.invisible = invisible;
        this.see_all = see_all;
        this.addresses = [];
    }

    setAddresses(header,address){
        let tags = [];
        tags = lodash.split(header,' ');
        if(tags[0]==="phone"){
          const pn = ppn.parsePhoneNumber( address, 'BR' );
          if(pn.isValid()){
            let newAddress = pn.getNumber( 'e164' );
            let adr = new Address(tags[0], newAddress);
            adr.setTags(lodash.drop(tags));
            this.addresses.push(adr);
          }
        }
        else if (tags[0]==="email"){
          let adr = new Address(tags[0], address)
          adr.setTags(lodash.drop(tags));
          this.addresses.push(adr);
        }
    }

    setGroups(){
        this.groups = [];
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
