# vEden MySQL

### Purpose

This package is a wrapper for the mysql nodejs client

### Usage

```javascript
const MySQLDatabase = require('veden-mysql').MySQLDatabase;
const db = new MySQLDatabase({
	DB_HOSTS : "localhost",
	DB_REPLICA_SET : "test",
	DB_USER : "admin",
	DB_PASS : "secret123"
	DB_DATABASE : "users"
});

let db_params = {
	collection: "user",
	limit: 10,
	fields: ["username","email"]
};
db.find(db_params,{email:'ryan.lawson437@gmail.com'}).then(result => {
	/* User data */
});
```

### Default Parameters
All methods take DB Parameters as the first argument, which can be;

**table**: Table to use  
**limit**: number of docs to return  
**fields**: fields to include in result  

The Second argument is the query, uses mongodb query syntax. Default is empty query (return all documents).

Write operations (insert, update, etc) take the document in the third argument

All methods return promises which resolve to their return type

### Available Methods

#### createConnection()

Returns a MySQL Connection as per [the documention](https://www.npmjs.com/package/mysql#introduction)

#### count()

TODO

#### find()

Returns
- fields: Array of fields' data
- rows: Array of rows as JSON

#### findOne()

Returns only the matching row as JSON

#### insertOne()

 TODO

#### insertMany()
 TODO

#### upsertOne()

 TODO

#### updateOne()

 TODO


#### updateMany()

 TODO

#### deleteOne()
 TODO

#### deleteMany()
 TODO
