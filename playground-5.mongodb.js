// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('Agreegate');

// Create a new document in the collection.
db.getCollection('pratice').insertMany([
{
  name: "Rahul",
  department: "Computer Science",
  marks: 85,
  age: 21,
  city: "Delhi",
  subjects: ["DBMS", "AI", "ML"]
},
{
  name: "Priya",
  department: "Computer Science",
  marks: 92,
  age: 22,
  city: "Mumbai",
  subjects: ["DBMS", "ML"]
},
{
  name: "Arjun",
  department: "Mechanical",
  marks: 76,
  age: 23,
  city: "Chennai",
  subjects: ["Thermodynamics", "Design"]
},
{
  name: "Sneha",
  department: "Electrical",
  marks: 88,
  age: 21,
  city: "Delhi",
  subjects: ["Circuits", "Electronics"]
},
{
  name: "Karan",
  department: "Computer Science",
  marks: 95,
  age: 22,
  city: "Bangalore",
  subjects: ["AI", "ML"]
},
{
  name: "Meena",
  department: "Mechanical",
  marks: 67,
  age: 24,
  city: "Hyderabad",
  subjects: ["Design", "Manufacturing"]
}
]);
