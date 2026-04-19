import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
    corePool: {
        type: Number,
        default: 1000,
        min: 0
    },
    // We can add other global stats here in the future
    lastPoolReset: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensures only one settings document exists
systemSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({ corePool: 1000 });
    }
    return settings;
};

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
export default SystemSettings;
