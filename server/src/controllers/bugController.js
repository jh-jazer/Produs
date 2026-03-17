import BugReport from '../models/BugReport.js';

// @desc    Submit a new bug report
// @route   POST /api/bugs
// @access  Private
const submitBug = async (req, res) => {
    try {
        const { title, description, severity } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const bug = await BugReport.create({
            user: req.user._id,
            title,
            description,
            severity
        });

        res.status(201).json(bug);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bug reports
// @route   GET /api/admin/bugs
// @access  Private/Admin
const getAllBugs = async (req, res) => {
    try {
        const bugs = await BugReport.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(bugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update bug report status or add response
// @route   PATCH /api/admin/bugs/:id
// @access  Private/Admin
const updateBugStatus = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const bug = await BugReport.findById(req.params.id);

        if (!bug) {
            return res.status(404).json({ message: 'Bug report not found' });
        }

        if (status) bug.status = status;
        if (adminResponse) bug.adminResponse = adminResponse;

        await bug.save();
        res.json(bug);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's bug reports
// @route   GET /api/bugs/my
// @access  Private
const getMyBugs = async (req, res) => {
    try {
        const bugs = await BugReport.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(bugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { submitBug, getAllBugs, updateBugStatus, getMyBugs };
