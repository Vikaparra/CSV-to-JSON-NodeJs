# CSV-to-JSON-NodeJs
 
This repository contains a CSV parser that gets student infos, organize them and turn into an JSON file.

Some important things to note are:
1 - It was assumed that there is a pattern on the input of the groups
 For example, the texts will always be "Sala n", "Turma n" (n being a random number) or "Diurno"/"Noturno"/"Integral" 
 So if there is an different input, the program will not recognize it as a group
 
2 - It was assumed that the phone numbers are always from Brazil, so they will be parsed and formated using the Brazilian patterns

3 - It was assumed that the only types of addresses are email and phone, so if there's another kind of input
 like 'whatsapp Pedagogical Responsible' it will not be recognized as an address
