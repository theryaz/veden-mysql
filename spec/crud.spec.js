describe("Test CRUD Functions", () => {
	const MySQLDatabase = require('../lib/index.js').MySQLDatabase;
	const options = {
		DB_HOST: process.env.DB_HOST || 'localhost',
		DB_CONNECTION_LIMIT: 10,
		DB_USER: process.env.DB_USER || 'root',
		DB_PASS: process.env.DB_PASS || 'changeme',
		DB_DATABASE: process.env.DB_DATABASE || 'TEST'
	};
	const db_params = { table: process.env.DB_TABLE || 'test', debug: true};
	console.log('Using Options for DB',options,"\n",db_params,"\n");
	beforeEach(() => {
		sql = new MySQLDatabase(options);
	});

	it("should insertOne document", async () => {
		let result = await sql.insertOne(Object.assign({},db_params),{
			name: 'Jasmine',
			email: 'jasmine@gmail.com',
			salary: ~~(Math.random() * 1000000) / 100,
			created: new Date('2017-11-27')
		});
		expect(result._id).toBeTruthy();
	});

	it("should insertMany documents", async () => {
		let result = await sql.insertMany(Object.assign({},db_params),[
			{
				name: 'Jasmine Many',
				email: 'jasmine.many1@gmail.com',
				salary: ~~(Math.random() * 1000000) / 100,
				created: new Date('2017-11-29')
			},
			{
				name: 'Jasmine Many',
				email: 'jasmine.many2@gmail.com',
				salary: ~~(Math.random() * 1000000) / 100,
				created: new Date('2017-11-29')
			}
		]);
		expect(result._id).toBeTruthy();
	});

	it("should count 3 documents", async () => {
		let result = await sql.count(Object.assign({},db_params),{});
		expect(result).toBe(3);
	});
	it("should count 2 documents", async () => {
		let result = await sql.count(Object.assign({},db_params),{name: 'Jasmine Many'});
		expect(result).toBe(2);
	});

	it("should count 2 documents with date greaterthan 2017-11-28", async () => {
		let date = new Date('2017-11-28')
		let result = await sql.count(Object.assign({},db_params),{['created>']:date});
		expect(result).toBe(2);
	});

	it("should updateOne document", async () => {
		let result = await sql.updateOne(Object.assign({},db_params),{name:'Jasmine'},{
			name: 'Jasmine Updated',
		});
		expect(result.modified).toBe(1);
	});

	it("should updateMany documents", async () => {
		let result = await sql.updateMany(Object.assign({},db_params),{name:'Jasmine Many'},{
			name: 'Jasmine Many Updated',
		});
		expect(result.modified > 1).toBeTruthy();
	});

	it("should findOne document", async () => {
		let result = await sql.findOne(Object.assign({},db_params),{name:'Jasmine Updated'});
		expect(result.name).toBe('Jasmine Updated');
	});

	it("should find documents", async () => {
		let result = await sql.find(Object.assign({},db_params),{name: 'Jasmine Many Updated'});
		expect(result.length > 1).toBeTruthy();
		expect(result[0].name).toBe('Jasmine Many Updated');
	});

	it("should find 3 documents", async () => {
		let result = await sql.find(Object.assign({},db_params),{});
		expect(result.length).toBe(3);
	});

	it("should deleteOne document", async () => {
		let result = await sql.deleteOne(Object.assign({},db_params),{name:'Jasmine Updated'});
		expect(result.deleted === 1).toBeTruthy();
	});

	it("should deleteMany documents", async () => {
		let result = await sql.deleteMany(Object.assign({},db_params),{name: 'Jasmine Many Updated'});
		expect(result.deleted > 1).toBeTruthy();
	});


});
