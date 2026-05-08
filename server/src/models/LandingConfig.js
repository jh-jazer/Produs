import mongoose from 'mongoose';

const landingConfigSchema = new mongoose.Schema({
    hero: {
        title: { type: String, default: 'SECOND CHANCE' },
        subtitle: { type: String, default: 'THE OPERATIVE HUD SYSTEM' },
        description: { type: String, default: 'A high-performance interface for managing the four pillars of human mastery.' }
    },
    mockups: {
        desktopImage: { type: String, default: '/desktopmock.png' },
        mobileImage: { type: String, default: '/mobilemock.png' },
        responsivenessText: { type: String, default: 'YOUR WORKFLOW, UNLEASHED. SYNCED ACROSS ALL DEVICES.' }
    },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Single document pattern
landingConfigSchema.statics.getConfig = async function() {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

const LandingConfig = mongoose.model('LandingConfig', landingConfigSchema);
export default LandingConfig;
