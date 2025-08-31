import mongoose from 'mongoose';
import userModel from './models/userModel.js';
import 'dotenv/config';

const migrateCartData = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/Threadsy`);
    console.log('Connected to MongoDB for migration');

    // Find all users with Array cartData
    const users = await userModel.find({ cartData: { $type: 'array' } });
    console.log(`Found ${users.length} users with Array cartData to migrate`);

    for (const user of users) {
      // Convert Array to Object
      user.cartData = {};
      await user.save();
      console.log(`Migrated user: ${user.email}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateCartData();
