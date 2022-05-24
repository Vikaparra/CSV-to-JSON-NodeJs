# CSV-to-JSON-NodeJs
 
### This repository contains a CSV parser that gets student infos, organize them and turn into an JSON file.

### Some important things to note are:
#### 1 - It was assumed that there is a pattern on the input of the groups
* For example, the texts will always be "Classe n ", "Sala n", "Turma n" (n being a random number) or "Diurno"/"Noturno"/"Integral" 
*  So if there is an different input, like "Disciplina SI198", the program will not recognize it as a group

#### 2 - It was assumed that the phone numbers are always from Brazil
* So they will be parsed and formated using the Brazilian patterns
#### 3 - It was assumed that the only types of addresses are email and phone
* So if there's another kind of input, for example 'whatsapp Pedagogical Responsible' it will not be recognized as an address

## How to run the code

#### This program expects one CSV file as the "input.csv"
* The CSV file must be in the same directory that "index.js"
#### The output of the program is an JSON file named "output.json"
#### To run the code you can open the directory where the project is located on your command prompt and run the next 2 commands:
```bash
npm install
node index.js
```
#### For example:
```bash
C:\Users\user> cd C:\Users\user\Documents\Projects\CSV-to-JSON-NodeJs\
C:\Users\user\Documents\Projects\CSV-to-JSON-NodeJs> npm install
C:\Users\user\Documents\Projects\CSV-to-JSON-NodeJs> node index.js
```
