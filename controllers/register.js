const bcrypt = require('bcrypt-nodejs');

const registerHandler = (req, res, db) => {
	const {email, name, password} = req.body;
	const hash = bcrypt.hashSync(password);
	
	if( !email || !name || !password) {
		return res.status(400).json("Fields cannot be empty");
	}
	db.transaction( trx => {
		trx.insert({
			email : email,
			hash : hash
		})
		.into('login')
		.returning('email')
		.then( loginEmail => {
			trx.insert({
				email : loginEmail[0],
				name : name,
				joined : new Date()
			})
			.into('users')
			.returning('*')
			.then( user => res.json(user[0]))
			.then(trx.commit)
			.catch(trx.rollback)
		})
	})
	.catch(err => res.status(400).json("Unable to register"))
}

module.exports = {
	registerHandler : registerHandler
}