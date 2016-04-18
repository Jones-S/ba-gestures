// function functionReplacer(key, value) {
//     if (typeof(value) === 'function') {
//         return value.toString();
//     }
//     return value;
// }

// function functionReviver(key, value) {
//     if (key === "") return value;

//     if (typeof value === 'string') {
//         var rfunc = /function[^\(]*\(([^\)]*)\)[^\{]*{([^\}]*)\}/,
//             match = value.match(rfunc);

//         if (match) {
//             var args = match[1].split(',').map(function(arg) { return arg.replace(/\s+/, ''); });
//             console.log("match[2]: ", match[2]);
//             var apply_args = args + match[2];
//             var func = Function.apply(null, apply_args);
//             return func;
//             // return new Function(args, match[2]);
//         }
//     }
//     return value;
// }

// var person = {
//         name : 'John Smith',
//         age : 42,
//         isJohn: function() {
//             return !!this.name.match(/John/);
//         }
//     };

// jsonString = JSON.stringify(person, functionReplacer);
// console.log("jsonString: ", jsonString);
// restoredPerson = JSON.parse(jsonString, functionReviver);
// console.log("restoredPerson: ", restoredPerson);

// console.log(restoredPerson.isJohn());