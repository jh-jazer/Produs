import mongoose from 'mongoose';
const uri = 'mongodb+srv://ernestodesabillejr_db_user:EIHMSbJ7xNiM2kDK@cluster0.srg2q4v.mongodb.net/?appName=Cluster0';
mongoose.connect(uri).then(async () => {
  console.log('Connected');
  const dbs = await mongoose.connection.db.admin().listDatabases();
  console.log(dbs.databases.map(d => d.name));
  
  const UserSchema = new mongoose.Schema({}, { strict: false });
  
  // check default DB 'test'
  console.log('--- TEST DB ---');
  let User = mongoose.connection.useDb('test').model('User', UserSchema, 'users');
  let users = await User.find({}, 'name email level').lean();
  console.log(users);
  
  // check 'produs'
  console.log('--- PRODUS DB ---');
  let UserProdus = mongoose.connection.useDb('produs').model('User', UserSchema, 'users');
  let usersProdus = await UserProdus.find({}, 'name email level').lean();
  console.log(usersProdus);

  process.exit(0);
}).catch(console.error);
