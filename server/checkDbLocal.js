import mongoose from 'mongoose';

// Attempt short timeout so it doesn't hang if Mongo isn't running
const uri = 'mongodb://127.0.0.1:27017/produs';
mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 }).then(async () => {
    console.log('Connected to Local MongoDB');
    
    const UserSchema = new mongoose.Schema({}, { strict: false });
    let User = mongoose.connection.useDb('produs').model('User', UserSchema, 'users');
    let users = await User.find({ email: 'ernestodesabillejr@gmail.com' }, 'name email level').lean();
    console.log('Local Users:', users);

    process.exit(0);
}).catch(err => {
    console.log('Local MongoDB not running or accessible', err.message);
    process.exit(0);
});
