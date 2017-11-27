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
	query(query_string){
		let pool = this.pool;
		return new Promise((resolve, reject) => {
			if(query_string === undefined) reject("No Query Provided!");
			pool.query(query_string,(err, rows, fields) => {
				if(err) reject(err);
				resolve({rows,fields});
			});
		});
	}
	async findOne(db_params,query){
		db_params.limit = 1;
		let result = await this.find(db_params,query);
		return result.rows[0];
	}
	find(db_params,query){
		if(!db_params.table) throw new Error("No Table Provided");
		let limit = db_params.limit || 10;
		let pool = this.pool;
		let projection = '*';
		if(db_params.fields) projection = db_params.fields.join(',');
		let where = '';
		if(query){
			let keys = Object.keys(query);
			where = 'WHERE ' + keys.map(x => `${x}='${query[x]}'`).join(' and ');
		}
		let query_string = `SELECT ${projection} FROM ${db_params.table} ${where} LIMIT ${limit}`
		return new Promise((resolve, reject) => {
			if(query_string === undefined) reject("No Query Provided!");
			pool.query(query_string,(err, rows, fields) => {
				if(err) reject(err);
				resolve({rows,fields});
			});
		});
	}
}
module.exports = MySQLDatabase;
