const mysql = require('mysql');

class MySQLDatabase{
	constructor(opts={}){
		this.options = {
			DB_HOST : opts.DB_HOST,
			DB_CONNECTION_LIMIT : opts.DB_CONNECTION_LIMIT || 10,
			DB_USER : opts.DB_USER,
			DB_PASS : opts.DB_PASS,
			DB_DATABASE : opts.DB_DATABASE,
		};
		if(this.options.DB_HOST === undefined) throw new Error("DB_HOST not provided.");
		if(this.options.DB_USER === undefined) throw new Error("DB_USER not provided.");
		if(this.options.DB_PASS === undefined) throw new Error("DB_PASS not provided.");
		if(this.options.DB_DATABASE === undefined) throw new Error("DB_DATABASE not provided.");

		this.connection_options = {
			host: this.options.DB_HOST,
			connectionLimit: this.options.DB_CONNECTION_LIMIT,
			user: this.options.DB_USER,
			password: this.options.DB_PASS,
			database: this.options.DB_DATABASE
		};
		this.pool = mysql.createPool(this.connection_options);
	}
	createConnection(){
		return mysql.createConnection(this.connection_options);
	}
	query(db_params,query_string){
		let pool = this.pool;
		return new Promise((resolve, reject) => {
			if(query_string === undefined) reject("No Query Provided!");
			if(db_params.debug) console.info("\nRunning Query",query_string);
			pool.query(query_string,(err, rows, fields) => {
				if(err !== null){ reject(err); return;}
				resolve({rows,fields});
			});
		});
	}
	count(db_params,query){
		if(!db_params.table) throw new Error("No Table Provided");
		let pool = this.pool;
		let where = true;
		if(query && Object.keys(query).length > 0){
			let keys = Object.keys(query);
			where = keys.map(x => `${x}=${pool.escape(query[x])}`).join(' and ');
		}
		let query_string = `SELECT COUNT(*) FROM ${db_params.table} WHERE ${where}`
		if(db_params.debug) console.info("\nPrepared Query",query_string);
		return new Promise((resolve, reject) => {
			if(query_string === undefined) reject("No Query Provided!");
			pool.query(query_string,(err, rows, fields) => {
				if(err !== null){ reject(err); return;}
				resolve(rows[0]['COUNT(*)']);
			});
		});
	}
	async findOne(db_params,query){
		db_params.limit = 1;
		let result = await this.find(db_params,query);
		if(result)
			return result[0];
		else
			return null;
	}
	find(db_params,query){
		if(!db_params.table) throw new Error("No Table Provided");
		let limit = db_params.limit || 10;
		let pool = this.pool;
		let projection = '*';
		if(db_params.fields) projection = db_params.fields.join(',');
		let sort = false;
		let sort_order = [];
		if(db_params.sort){
			for(let k of Object.keys(db_params.sort)){
				sort_order.push(`${k} ${db_params.sort[k] === 'asc' ? 'ASC' : 'DESC'}`);
			}
			sort = true;
		}

		let where = true;
		if(query && Object.keys(query).length > 0){
			let keys = Object.keys(query);
			where = keys.map(x => `${x}=${pool.escape(query[x])}`).join(' and ');
		}
		let query_string = `SELECT ${projection} FROM ${db_params.table} WHERE ${where}`
		if(sort === true) query_string += ` ORDER BY ${sort_order.join(',')}`;
		query_string += ` LIMIT ${limit}`;

		if(db_params.debug) console.info("\nPrepared Query",query_string);
		return new Promise((resolve, reject) => {
			if(query_string === undefined) reject("No Query Provided!");
			pool.query(query_string,(err, rows, fields) => {
				if(err !== null){ reject(err); return;}
				resolve(rows);
			});
		});
	}
	insertOne(db_params, doc){
		let pool = this.pool;
		if(db_params.table === undefined) throw new Error("Table not provided");
		if(doc === undefined) throw new Error("No document provided");
		let columns = [],values = [],placeholders = [], placeholder;
		for(let key of Object.keys(doc)){
			placeholders.push('?')
			columns.push(key);
			values.push(doc[key]);
		}
		placeholder = placeholders.join(',');
		let query_string = `INSERT INTO ${db_params.table} (${columns.join(',')}) VALUES (${placeholder})`;
		if(db_params.debug) console.info("\nPrepared Query",query_string);
		return new Promise((resolve, reject) => {
			pool.query(query_string,values,(err, result) => {
				if(err !== null){ reject(err); return;}
				resolve({
					_id: result.insertId,
					result
				});
			});
		});
		return;
	}
	async insertMany(db_params, docs){
		let pool = this.pool;
		if(db_params.table === undefined) throw new Error("Table not provided");
		if(!Array.isArray(docs) || docs.length === 0) throw new Error("No document array provided");
		let columns = [],values = [],placeholders = [], placeholder;
		for(let doc of docs){
			let keys = Object.keys(doc);
			if (columns.length === 0) {
				columns = keys.slice(0);
				placeholder = `(${columns.map(x => '?').join(',')})`; // Make string like (?,?,?,?) for each doc
			}else if (columns.length !== keys.length) {
				throw new Error(`Column / Value mismatch. Found ${keys.length} values, expected ${columns.length} in document: ${JSON.stringify(doc)}`);
			}
			placeholders.push(placeholder);
			for(let i in columns){
				if(keys[i] !== columns[i]) throw new Error(`Column mismatch. Found ${keys[i]}, expected ${columns[i]}`)
				values.push(doc[columns[i]]);
			}
		}
		let query_string = `INSERT INTO ${db_params.table} (${columns.join(',')}) VALUES ${placeholders.join(',')}`;
		if(db_params.debug) console.info("\nPrepared Query",query_string);
		return new Promise((resolve, reject) => {
			pool.query(query_string,values,(err, result) => {
				if(err !== null){ reject(err); return;}
				resolve({
					_id: result.insertId,
					result
				});
			});
		});
		return {
			_ids: insert_result.insertedIds,
			result: insert_result.result
		};
	}
	// async upsertOne(db_params, query={}, doc){
	// 	if(db_params.table === undefined) throw new Error("Table not provided");
	// 	return null;
	// }
	updateOne(db_params, query, doc){
		db_params.limit = 1;
		return this.updateMany(db_params,query, doc);
	}
	updateMany(db_params, query={}, doc){
		let pool = this.pool;
		if(db_params.table === undefined) throw new Error("Table not provided");
		if(doc === undefined) throw new Error("No document provided");
		let limit = db_params.limit || undefined;
		let where = true;
		if(query && Object.keys(query).length > 0){
			let keys = Object.keys(query);
			where = keys.map(x => `${x}=${pool.escape(query[x])}`).join(' and ');
		}

		let keys = Object.keys(doc);
		let assignments = keys.map(x => `${x}=${pool.escape(doc[x])}`).join(',');

		let query_string = `UPDATE ${db_params.table} SET ${assignments} WHERE ${where}`;
		if(limit > 0) query_string += ` limit ${limit}`;
		if(db_params.debug) console.info("\nPrepared Query",query_string);
		return new Promise((resolve, reject) => {
			pool.query(query_string,(err, result) => {
				if(err !== null){ reject(err); return;}
				resolve({
					matched: result.affectedRows,
					modified: result.changedRows,
					result
				});
			});
		});
		return;
	}
	deleteOne(db_params, query){
		db_params.limit = 1;
		return this.deleteMany(db_params,query);
	}
	deleteMany(db_params, query){
		if(!db_params.table) throw new Error("No Table Provided");
		let limit = db_params.limit || 10;
		let pool = this.pool;
		let where = true;
		if(query && Object.keys(query).length > 0){
			let keys = Object.keys(query);
			where = keys.map(x => `${x}=${pool.escape(query[x])}`).join(' and ');
		}
		let query_string = `DELETE FROM ${db_params.table} WHERE ${where} LIMIT ${limit}`
		if(db_params.debug) console.info("\nPrepared Query",query_string);
		return new Promise((resolve, reject) => {
			if(query_string === undefined) reject("No Query Provided!");
			pool.query(query_string,(err, result) => {
				if(err !== null){ reject(err); return;}
				resolve({
					deleted: result.affectedRows,
					result
				});
			});
		});
	}
}
module.exports = MySQLDatabase;
