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

#### query(query_string)

Run a generic query, returns promise resolving to result
Returns
- fields: Array of fields' data
- rows: Array of rows as JSON


#### count()

TODO

#### find()

Returns
- fields: Array of fields' data
- rows: Array of rows as JSON

#### findOne()

Returns only the first row to match as JSON

#### insertOne()

Returns
- \_id: ID of inserted document
- result: Raw Response from database (varies by server implementation)

#### insertMany()
Returns
- \_id: ID of the first inserted document
- result: Raw Response from database (varies by server implementation)

#### updateOne()

Returns
- matched: Number of matched documents
- modified: Number of modified documents
- result: Raw Response from database (varies by server implementation)

#### updateMany()

Returns
- matched: Number of matched documents
- modified: Number of modified documents
- result: Raw Response from database (varies by server implementation)

#### deleteOne()
Returns
- deleted: count of deleted documents

#### deleteMany()
Returns
- deleted: count of deleted documents
